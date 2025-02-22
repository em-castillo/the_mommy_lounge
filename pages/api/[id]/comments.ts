import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from "@/lib/mongodb";  // Make sure this is correctly imported

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;  // `id` will be available in `req.query` in Pages Router

    // Validate MongoDB ObjectId format
    if (!ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    // MongoDB client setup
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const postsCollection = db.collection("posts");

    // Find the post and fetch the comments
    const post = await postsCollection.findOne(
      { _id: new ObjectId(id as string) },
      { projection: { comments: 1 } }
    );

    // If no post is found
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Return the comments
    return res.status(200).json(post.comments || []);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
}
