// Shows a single post with comments if available

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  author: string;
  timestamp: string;
}

interface Post {
  _id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  comments: Comment[];
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/posts?id=${id}`);
      if (res.ok) {
        setPost(await res.json());
      }
    }
    fetchPost();
  }, [id]);

  async function handleAddComment() {
    if (!newComment.trim()) return;

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment, author: "User" }), // Change "User" dynamically
    });

    if (res.ok) {
      const { comment } = await res.json();
      setPost((prev) => prev ? { ...prev, comments: [...prev.comments, comment] } : prev);
      setNewComment("");
    } else {
      console.error("Failed to submit comment");
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {post ? (
        <>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="mt-2">{post.content}</p>

          {/* Comment Section */}
          <h2 className="mt-6 text-xl font-semibold">Comments</h2>
          <ul className="mt-2 space-y-2">
            {post.comments?.length ? (
              post.comments.map((comment) => (
                <li key={comment.id} className="border p-2 rounded">
                  <Link href={`/profile/${comment.userId}`}>
                    <p className="text-blue-500">{comment.username}</p>
                  </Link>
                  <p>{comment.text}</p>
                  <small className="text-gray-500">By {comment.author}</small>
                </li>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </ul>

          {/* Comment Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
              className="border p-2 flex-grow rounded"
            />
            <button
              onClick={handleAddComment}
              className="bg-red-200 text-pink-600 px-4 py-2 rounded"
            >
              Comment
            </button>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
