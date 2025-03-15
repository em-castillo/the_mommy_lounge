"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditPostPage({ params }: { params: Promise<{ category: string; id: string }> }) {
  const router = useRouter();
  const { category, id } = use(params); 
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch the existing post data when the component mounts or when 'id' changes
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`); 
        const post = await res.json();
        if (res.ok) {
          setTitle(post.title); 
          setContent(post.content);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      }
    }
    fetchPost();
  }, [id]);

  
  async function handleUpdatePost(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/posts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, title, content }), 
      });

      if (!res.ok) throw new Error("Failed to update post");
      router.push(`/home/${category}`); // Redirect to category page after update
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <form onSubmit={handleUpdatePost} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border p-2 rounded"
        />
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="border p-2 rounded h-32"
        />
        <button type="submit" 
        title="Update"
        className="bg-red-200 text-pink-600 px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}
