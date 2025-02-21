import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET 
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const post = await postsCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { comments: 1 } } // Fetch only comments);
    );

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post.comments || [], { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST 
export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    const body = await req.json();
    // console.log("Received Data:", body);

    const { text, author } = body;
    if (!text || !author) {
      return NextResponse.json({ error: "Missing comment text or author" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const newComment = {
      id: new ObjectId().toString(),
      text,
      author,
      timestamp: new Date().toISOString(),
    };

    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { comments: newComment } }
    );

    if (!result.modifiedCount) {
      return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

// PATCH
export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
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

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

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
export async function DELETE(req: Request,  context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { commentId } = body; // Extract commentId from the body

    if (!commentId) {
      return NextResponse.json({ error: "Missing comment ID" }, { status: 400 });
    }

    if (!ObjectId.isValid(commentId) || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    // Delete the comment from the post by comment ID
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) }, // Find the post by its ID
      /* eslint-disable @typescript-eslint/no-explicit-any */
      { $pull: { comments: { id: commentId } } } as any // Remove the comment by its ID
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
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
