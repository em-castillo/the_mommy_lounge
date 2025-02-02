// import clientPromise from '@/lib/mongodb';
// import { NextResponse } from 'next/server';

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
