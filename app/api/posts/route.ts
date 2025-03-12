import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

// GET
export async function GET(req: NextRequest) {
  const res = NextResponse.next();

  // Add CORS headers directly in the response
  res.headers.set('Access-Control-Allow-Origin', 'https://the-mommy-lounge.vercel.app'); // Your frontend URL
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const url = new URL(req.url);
    let category = url.searchParams.get("category"); 
    const query = url.searchParams.get("query") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    
    if (category) {
      category = decodeURIComponent(category);
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");
    
    const filter: Record<string, unknown> = {};
    
    if (category) {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive 
        { content: { $regex: query, $options: "i" } }, 
        { "comments.text": { $regex: query, $options: "i" } },
      ];
    }

    // Count total matching posts
    const totalCount = await postsCollection.countDocuments(filter);

    const posts = await postsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      

    // Get unique userIds from posts
    const userIds = [...new Set(posts.map((post) => post.userId))];

    // Fetch user details from Clerk for all userIds
    const users = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const user = await clerkClient.users.getUser(userId);
          return { userId, username: user?.username || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown", };
        } catch {
          return { userId, username: "Unknown" };
        }
      })
    );

    // Create a user map for quick lookup
    const userMap = new Map<string, string>(
      users.map((user) => [user.userId, user.username || "Unknown"])
    );
    
    // Attach username to posts
    const postsWithUsernames = posts.map(post => ({
      ...post,
      username: post.username || userMap.get(post.userId) || "Unknown",
    }));

    return NextResponse.json({ posts: postsWithUsernames, totalCount }, { status: 200 });
    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
  }


// get all posts http://localhost:3000/api/posts
// get posts by category http://localhost:3000/api/posts?category=momLife
// get post by id http://localhost:3000/api/posts?id=67a45454f41f7f7abfdfe3f6


//POST
export async function POST(req: NextRequest) {
  try {
    const authData = await auth(); // Await the auth function
    const userId = authData?.userId; // Get the userId from auth
  
    if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const body = await req.json(); 
    const { title, category, content } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const decodedCategory = decodeURIComponent(category);

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const username = user.username || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown"; // Get username

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const result = await postsCollection.insertOne({ 
      userId, //store user id
      username,
      title, 
      category: decodedCategory, 
      content, 
      createdAt: new Date() });

    return NextResponse.json({ message: "Post created", id: result.insertedId, username }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// UPDATE
export async function PATCH(req: NextRequest) {
  try {
    const authData = await auth(); 
    const userId = authData?.userId; 

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } 

    const body = await req.json();
    const { id, title, content } = body; // Extract post ID and updated fields

    if (!id || !title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

  // Ensure the post belongs to the user
  const post = await postsCollection.findOne({ _id: new ObjectId(id) });
  
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized to edit this post" }, { status: 403 });
  }

    // Update the post
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) }, // Find the post by ID
      { $set: { title, content } } // Update the title and content
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes made to the post" }, { status: 200 });
    }

    return NextResponse.json({ message: "Post updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

//DELETE
export async function DELETE(req: NextRequest) {
  try {
    const authData = await auth(); 
    const userId = authData?.userId; 

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 });
    }

    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

