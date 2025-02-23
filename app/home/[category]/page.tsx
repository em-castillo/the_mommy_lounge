// Shows posts by category

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { use } from "react"; //unwrap params
import Search from "@/app/ui/home/search";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import { ChatBubbleOvalLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SignedIn } from '@clerk/nextjs';

interface Post {
  _id: string;
  title: string;
  content: string;
  comments: { id: string }[];
}

export default function Page({ params }: { params: Promise<{ category: string }> }) {

    const { category } = use(params); // Extract category from URL params
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || ""; // Get search query from URL
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // category is decoded to handle special characters 
    const decodedCategory = decodeURIComponent(category);

   
    useEffect(() => {
      async function fetchPosts() {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?category=${encodeURIComponent(decodedCategory)}&query=${encodeURIComponent(query)}`,
            { cache: "no-store" }
          );
  
          if (!res.ok) {
            throw new Error("Failed to fetch posts");
          }
  
          const data = await res.json();
          setPosts(data);
        } catch (err) {
          setError("Something went wrong while fetching posts.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
  
      if (decodedCategory) {
        fetchPosts();
      }
    }, [decodedCategory, query]);
  
    const handleNewPost = () => {
      router.push(`/home/${decodedCategory}/new-post`);
    };

    // Deletes post by ID
    async function handleDelete(postId: string) {
      if (!confirm("Are you sure you want to delete this post?")) return;
  
      try {
        const res = await fetch("/api/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: postId }),
        });
  
        if (!res.ok) throw new Error("Failed to delete post");
  
        // Remove deleted post from state
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }

    function highlightText(text: string, searchTerm: string) {
      if (!searchTerm) return text;
      const regex = new RegExp(`(${searchTerm})`, "gi");
      return text.split(regex).map((part, i) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={i} className="bg-red-200">{part}</mark>
        ) : (
          part
        )
      );
    }
   
    return (
      
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>{decodedCategory} forum</h1>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Search topics..." />
          <SignedIn>
          <button 
            onClick={handleNewPost} 
            className="bg-red-200 text-pink-600 px-4 py-2 rounded-lg shadow-md hover:bg-red-300 transition"
        >
          New Post
        </button>
        </SignedIn>
        </div>
        {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense> */}

      <div className="mt-5">
      {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <p>No posts available in this category yet.</p>
        ) : (
          <ul className="w-full flex flex-col items-center">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {posts.map((post: any) => ( 
              <li key={post._id} className="mb-4 w-full">
                <div className="border p-4 rounded-lg shadow-md  flex justify-between items-start">
                <div className="flex flex-col w-full">
                  <h3 className="font-semibold text-lg">{highlightText(post.title, query)}</h3>
                  <p>{highlightText(post.content, query)}</p>
                  </div>

                  <div className="ml-4 flex justify-between gap-2">
                    {/* Comment Button */}
                  <Link href={`/home/${category}/post/${post._id}`}>
                    <button className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition flex items-center gap-1">
                      <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                      <span>{post.comments?.length || 0}</span> {/* Show number of comments */}
                    </button>
                  </Link> 
                  {/* Edit Button */}
                  <SignedIn>
                  <Link href={`/home/${category}/edit/${post._id}`}>
                    <button className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition">
                    <PencilIcon className="w-5 h-5" />
                    </button>
                  </Link>
                  {/* Delete Button */}
                    <button onClick={() => handleDelete(post._id)} 
                     className=" border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    </SignedIn>
                  </div>
                  </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    );
  }