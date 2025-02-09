"use client";

import { use, useEffect, useState } from "react";

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  comments: Comment[];
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ Unwrapping `params` promise
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");

  // ✅ Fetch post with comments
  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
  try {
    const res = await fetch(`/api/posts/${id}`);

    if (!res.ok) {
      const errorText = await res.text(); 
        throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const postData = await res.json();
    setPost(postData);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Failed to fetch post:", err.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}
    fetchPost();
  }, [id]);


  // ✅ Submit comment
  async function handleAddComment() {
    if (!newComment.trim()) return;

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment, author: "User" }),
    });

    const data = await res.json();

    if (res.ok) {
      setPost((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), data.comment] } : prev
      );
      setNewComment("");
    } else {
      console.error("Failed to submit comment:", data.error);
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
            {post.comments?.length > 0 ? (
              post.comments.map((comment) => (
                <li key={comment.id} className="border p-2 rounded">
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
          <label htmlFor="commentInput" className="sr-only">Write a comment</label>
          <input
            type="text"
            id="commentInput"  
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
