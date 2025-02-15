import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET posts based by category or post ID
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // const id = url.searchParams.get("id"); // get post by ID
    let category = url.searchParams.get("category"); // Get category from query params

    if (category) {
      category = decodeURIComponent(category); // Decode category 
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");


    // if (id) {
    //   // Fetch a single post by ID
    //   const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    //   return NextResponse.json(post, { status: 200 });
    // }

    let posts;
    if (category) {
      posts = await postsCollection.find({ category }).toArray(); // Filter by category
    } else {
      posts = await postsCollection.find().toArray(); // Fetch all posts if no category provided
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// get all posts http://localhost:3000/api/posts
// get posts by category http://localhost:3000/api/posts?category=momLife
// get post by id http://localhost:3000/api/posts?id=67a45454f41f7f7abfdfe3f6


//POST
export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse incoming request body
    const { title, category, content } = body;

    if (!title || !category || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const decodedCategory = decodeURIComponent(category);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const result = await postsCollection.insertOne({ title, category: decodedCategory, content });

    return NextResponse.json({ message: "Post created", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// UPDATE
export async function PATCH(req: Request) {
  try {
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
export async function DELETE(req: Request) {
  try {
  
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

