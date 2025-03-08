// POSTS BY ID ROUTE

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET 
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const res = NextResponse.next();

  // Add CORS headers directly in the response
  res.headers.set('Access-Control-Allow-Origin', 'https://the-mommy-lounge-6o2pl0pky-emilys-projects-1e77953c.vercel.app'); 
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const params = await context.params;
    const id = params.id; 

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

