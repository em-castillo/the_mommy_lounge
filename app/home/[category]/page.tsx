"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { use } from "react"; //unwrap params
import Search from "@/app/ui/home/search";
import { lusitana } from "@/app/ui/fonts";

interface Post {
  _id: string;
  title: string;
  content: string;
}

export default function Page({ params }: { params: Promise<{ category: string }> }) {
// export default async function Page(props: {
//     searchParams?: Promise<{
//       query?: string;
//       page?: string;
//     }>;
//   }) {
    // const searchParams = await props.searchParams;
    // const query = searchParams?.query || '';
    // const currentPage = Number(searchParams?.page) || 1;

    const { category } = use(params); // Extract category from URL params
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // category is decoded to handle special characters (&, spaces, etc.)
    const decodedCategory = decodeURIComponent(category);

   
    useEffect(() => {
      async function fetchPosts() {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/posts?category=${encodeURIComponent(decodedCategory)}`,
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
    }, [decodedCategory]);
  
    const handleNewPost = () => {
      router.push(`/home/${decodedCategory}/new-post`);
    };
   
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>{decodedCategory} forum</h1>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Search topics..." />
          <button 
            onClick={handleNewPost} 
            className="bg-red-200 text-pink-600 px-4 py-2 rounded-lg shadow-md hover:bg-red-300 transition"
        >
          New Post
        </button>
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
                <div className="border p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p>{post.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    );
  }