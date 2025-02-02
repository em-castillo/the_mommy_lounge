import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// export async function GET(req: Request, { params }: { params: { postId: string } }) {
//   try {
//     const client = await clientPromise;
//     const db = client.db('mommyForum');
//     const comments = await db.collection('comments').find({ postId: params.postId }).toArray();

//     return NextResponse.json(comments);
//   } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
//     return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
//   }
// }

// get function from posts/route.ts Delete!
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
