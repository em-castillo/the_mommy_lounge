import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../../utils/db";
import { ObjectId } from "mongodb";
import { auth } from "@clerk/nextjs/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { db } = await connectToDatabase();
  const { userId } = await auth();
  const { postId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const post = await db.collection("posts").findOne({ _id: new ObjectId(postId as string) });

      if (!post) return res.status(404).json({ error: "Post not found" });

      const newReply = {
        postId: new ObjectId(postId as string),
        userId,
        text,
        createdAt: new Date(),
      };

      const result = await db.collection("replies").insertOne(newReply);

      // Create a notification for the post owner (only if the replier is NOT the post owner)
      if (post.userId !== userId) {
        await db.collection("notifications").insertOne({
          userId: post.userId, // Post owner's ID
          postId,
          replyId: result.insertedId,
          message: `Someone replied to your post: "${post.title}"`,
          read: false,
          createdAt: new Date(),
        });
      }

      return res.status(201).json({ message: "Reply added", reply: newReply });
    } catch {
      return res.status(500).json({ error: "Failed to add reply" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
