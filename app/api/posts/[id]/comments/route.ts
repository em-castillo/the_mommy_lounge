import { NextResponse, NextRequest } from "next/server";
// import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { connectToDatabase } from "@/utils/db";

// GET 
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {

  try {
    const params = await context.params;
    const id = params.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    // const client = await clientPromise;
    // const db = client.db(process.env.MONGODB_DB);
    const { db } = await connectToDatabase();
    const postsCollection = db.collection("posts");

    const post = await postsCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { comments: 1 } } // Fetch only comments
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sort comments (newest first)
    if (post && post.comments) {
      post.comments.sort((a:{ timestamp: string }, b: { timestamp: string }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    // Fetch usernames for comments
    if (post.comments && post.comments.length > 0) {
      // Get unique user IDs from comments
      const userIds = post.comments.map((comment: { userId: string }) => comment.userId);
      const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates

      // Fetch user details from Clerk
      const users = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const user = await clerkClient.users.getUser(userId as string);
            return { userId, username: user.username || user.firstName || "Unknown" };
          } catch {
            return { userId, username: "Unknown" };
          }
        })
      );
              

      // Create a mapping of userId to username
      const userMap = Object.fromEntries(users.map((user) => [user.userId, user.username]));

      // Assign usernames to comments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      post.comments = post.comments.map((comment: any) => ({
        ...comment,
        username: userMap[comment.userId] || "Unknown",
      }));
    }

    return NextResponse.json(post.comments || [], { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}


// POST 
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authData = await auth(); 
    const userId = authData?.userId; 
  
    if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Missing comment text" }, { status: 400 });
    }

    // Fetch username from Clerk
    const user = await clerkClient.users.getUser(userId);
    const username = user?.username || user?.firstName || "Unknown";

    const { db } = await connectToDatabase();
    const postsCollection = db.collection("posts");
    const notificationsCollection = db.collection("notifications");

    // Find the post to get the post owner's ID
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postOwnerId = post.userId; // Assuming the post has a `userId` field

    const newComment = {
      id: new ObjectId().toString(),
      userId,
      username,
      text,
      timestamp: new Date().toISOString(),
    };

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { comments: newComment } }
    );

    if (!result.modifiedCount) {
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    // Create a notification for the post owner (if the commenter is not the owner)
    if (postOwnerId !== userId) {
      const notification = {
        userId: postOwnerId, // Notify the post owner
        postId: id, // The post that received the comment
        commentId: newComment.id, // The new comment ID
        message: `New comment on your post: "${text}"`,
        isRead: false,
        createdAt: new Date(),
      };

      await notificationsCollection.insertOne(notification);
    }

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authData = await auth(); 
    const userId = authData?.userId; 
  
    if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { id } = await context.params;
    const body = await req.json();
    const { commentId, newText } = body; // Extract the comment ID and the new text for the comment

    // Validate input
    if (!commentId || !newText) {
      return NextResponse.json({ error: "Missing comment ID or new text" }, { status: 400 });
    }

    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const postsCollection = db.collection("posts");

   // Find the post containing the comment
   const post = await postsCollection.findOne({ _id: new ObjectId(id) });

   if (!post) {
     return NextResponse.json({ error: "Post not found" }, { status: 404 });
   }

   // Find the specific comment within the post
   /* eslint-disable @typescript-eslint/no-explicit-any */
   const comment = post.comments?.find((c: any) => c.id === commentId);

   if (!comment) {
     return NextResponse.json({ error: "Comment not found" }, { status: 404 });
   }

   // Ensure the user deleting the comment is the author
   if (comment.userId !== userId) {
     return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
   }

    // Update the comment
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id), "comments.id": commentId }, // Find post by ID and comment ID
      { $set: { "comments.$.text": newText } } // Update the text of the matching comment
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Post or comment not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes made to the comment" }, { status: 200 });
    }

    return NextResponse.json({ message: "Comment updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}


// DELETE 
export async function DELETE(req: Request,  context: { params: Promise<{ id: string }> }) {
  try {
    const authData = await auth(); 
    const userId = authData?.userId; 

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { id } = await context.params;
    const body = await req.json();
    const { commentId } = body; // Extract commentId from the body

    if (!commentId) {
      return NextResponse.json({ error: "Missing comment ID" }, { status: 400 });
    }

    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const postsCollection = db.collection("posts");

    // Find the post containing the comment
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Find the specific comment within the post
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const comment = post.comments?.find((c: any) => c.id === commentId);

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Ensure the user deleting the comment is the author
    if (comment.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
    }

    // Delete the comment from the post by comment ID
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) }, // Find the post by its ID
      /* eslint-disable @typescript-eslint/no-explicit-any */
      { $pull: { comments: { id: commentId } } } as any // Remove the comment by its ID
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Comment not found or already deleted" }, { status: 200 });
    }

    return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
