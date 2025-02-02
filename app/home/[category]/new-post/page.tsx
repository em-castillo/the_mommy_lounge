"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react"; //unwrap params

export default function NewPostPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const decodedCategory = decodeURIComponent(category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content, category }),
    });

    if (response.ok) {
      router.push(`/home/${decodedCategory}`); // Redirect back to category page
    } else {
      alert("Failed to create post");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Create a new post in {decodedCategory} forum</h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border p-2 mb-2 rounded"
        />
        <textarea
          placeholder="Post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="border p-2 mb-2 rounded h-32"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-red-200 text-pink-600 px-4 py-2 rounded-lg shadow-md hover:bg-red-300 transition disabled:bg-gray-400"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
