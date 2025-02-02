import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

//GET
// GET posts based on category (optional)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category"); // Get category from query params

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    let posts;
    if (category) {
      posts = await postsCollection.find({ category }).toArray(); // Filter by category
    } else {
      posts = await postsCollection.find().toArray(); // Fetch all posts if no category provided
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// get all posts http://localhost:3000/api/posts
// get posts by category http://localhost:3000/api/posts?category=momLife


//POST
export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse incoming request body
    const { title, category, content } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const result = await postsCollection.insertOne({ title, category, content });

    return NextResponse.json({ message: "Post created", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

