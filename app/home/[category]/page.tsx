// Shows posts by category

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { use } from "react"; //unwrap params
import Search from "@/app/ui/home/search";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import { ArrowLongLeftIcon, ArrowLongRightIcon, ChatBubbleOvalLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useUser, SignedIn } from '@clerk/nextjs';

interface Post {
  _id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  createdAt: string;
  comments: { id: string }[];
}

export default function Page({ params }: { params: Promise<{ category: string }> }) {

    const { user } = useUser(); // Get current signed-in user
    const userId = user?.id; // Clerk's user ID  
    const { category } = use(params); // Extract category from URL params
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || ""; // Get search query from URL
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 10; // Posts per page

    // category is decoded to handle special characters 
    const decodedCategory = decodeURIComponent(category);


   
    useEffect(() => {


      async function fetchPosts() {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?category=${encodeURIComponent(decodedCategory)}&query=${encodeURIComponent(query)}&page=${currentPage}&limit=${postsPerPage}`,
            { cache: "no-store",
              mode: 'no-cors',
             }
          );
  
          if (!res.ok) {
            throw new Error("Failed to fetch posts");
          }
  
          const data = await res.json();

          setPosts(data.posts); 
          setTotalPages(Math.ceil(data.totalCount / postsPerPage)); // Calculate total pages
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
    }, [decodedCategory, query, currentPage]);
  
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

      <div className="mt-5">
      {loading ? (
          <p>Loading posts...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : posts.length === 0 ? (
          <p>No posts available in this category yet.</p>
        ) : (
          <ul className="w-full flex flex-col items-center">
            {posts
            .slice() // Avoid mutating the original state
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((post: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <li key={post._id} className="mb-4 w-full">
                <div className="border p-4 rounded-lg shadow-md  flex justify-between items-start">
                <div className="flex flex-col w-full">
                  <h3 className="font-semibold text-lg">{highlightText(post.title, query)}</h3>
                  <p className="text-sm text-gray-500">
                    <strong>{post.username || "Unknown"}</strong>
                     {/* •{" "} */}
                    {/* {new Date(post.createdAt).toLocaleString()} */}
                  </p>
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
                 {/* Show Edit/Delete only if the user is the post owner */}
                 {userId === post.userId && (
                      <>
                  {/* Edit Button */}
                  <SignedIn>
                  <Link href={`/home/${category}/edit/${post._id}`}>
                    <button className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition">
                    <PencilIcon className="w-5 h-5" />
                    </button>
                  </Link>

                  {/* Delete Button */}
                    <button onClick={() => handleDelete(post._id)} 
                     className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    </SignedIn>
                    </>
                    )}
                  </div>
                  </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-5 gap-3">
            
            {/* Previous Button */}
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded hover:bg-red-50 transition"
              >
                <ArrowLongLeftIcon className="w-6 h-6" />
              </button>
            )}

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${currentPage === page ? "bg-pink-400 text-white" : "border border-pink-200 bg-white text-pink-600 hover:bg-red-50 transition"}`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded hover:bg-red-50 transition"
              >
                <ArrowLongRightIcon className="w-6 h-6" />
              </button>
            )}

          </div>
        )}

      </div>
    );
  }