import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { text, author } = await req.json(); // Parse request body
    const postId = params.id; // Get post ID from URL

    if (!postId || !text) {
      return NextResponse.json({ error: "Missing post ID or comment text" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const newComment = {
      id: new ObjectId().toString(), // Generate unique comment ID
      text,
      author: author || "Anonymous",
      timestamp: new Date().toISOString(),
    };

    // Update post by adding comment to `comments` array
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $addToSet: { comments: newComment } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Comment added", comment: newComment }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
