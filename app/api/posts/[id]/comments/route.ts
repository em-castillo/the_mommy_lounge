import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET 
export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
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
      _id: new ObjectId().toString(),
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
