"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChatBubbleOvalLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Post {
  _id: string;
  title: string;
  content: string;
}

interface Comment {
    // id: string;
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export default function PostPage() {
  const params = useParams();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { category, id } = params as { category: string; id: string };
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');

  // Fetch post and comments
  useEffect(() => {
    async function fetchData() {
      try {
        setError(null); 

        // Fetch post
        const postRes = await fetch(`/api/posts?id=${id}`);
        if (!postRes.ok) throw new Error("Failed to fetch post");
        const postData = await postRes.json();
        setPost(postData);

        // Fetch comments
        const commentsRes = await fetch(`/api/posts/${id}/comments`);
        if (!commentsRes.ok) {
          // If no comments exist, don't treat it as an error
          if (commentsRes.status === 404) {
            setComments([]); // No comments yet
          } else {
            throw new Error("Failed to fetch comments");
          }
        } else {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);


  useEffect(() => {
    async function fetchComments() {
      const res = await fetch(`/api/posts/${id}/comments`);
      const data = await res.json();
      setComments(data.comments);  // Set the fetched comments into state
    }
  
    fetchComments();
  }, [id]); // Run the effect when postId changes
  

// Add comment
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const author = "Anonymous";

    try {
        console.log("Sending Comment:", { text: newComment, author });

    const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment, author }),
      });

    if (!res.ok) throw new Error("Failed to add comment");
   
    setNewComment(""); // Clear input

    const updatedCommentsRes = await fetch(`/api/posts/${id}/comments`);
    if (!updatedCommentsRes.ok) throw new Error("Failed to fetch updated comments");
    
    const updatedComments = await updatedCommentsRes.json();
    setComments(updatedComments); 
      
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  // Edit comment
  // edit button
  function handleEditButtonClick(commentId: string, currentText: string) {
    setEditedText(currentText); // Set the current text of the comment to the input
    setOriginalText(currentText);
    setEditingCommentId(commentId); // Track which comment is being edited
  }

  // save button
  async function handleSaveButtonClick(commentId: string) {
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, newText: editedText }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      // Update the comments state to reflect the new text
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, text: editedText } : comment
        )
      );
      setEditedText('');
      setEditingCommentId(null); // Stop editing
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }

  // cancel button
  function handleCancelButtonClick() {
    setEditedText(originalText); // Revert to original text
    setEditingCommentId(null);
  }
  
  
  // Delete comment
  async function handleDeleteButtonClick(commentId: string) {
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }), // Send the comment ID to delete
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Update the comments state to remove the deleted comment
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }
  
  
  
  console.log("Comments array:", comments);
  return (
    <div className="max-w-2xl mx-auto mt-10">
      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : post ? (
        <>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="mt-2">{post.content}</p>

          {/* Comment Section */}
          <div className="mt-6 border-t pt-4">
            <h2 className="text-xl font-semibold flex items-center gap-1">
              <ChatBubbleOvalLeftIcon className="w-6 h-6" /> Comments
            </h2>

            <ul className="mt-4 space-y-2">
            {comments.length > 0 ? (
                comments.map((comment) => (
                  <li key={comment.id} className="border p-2 rounded">
                    {/* Display the comment text or editable input if it's being edited */}
                  {editingCommentId === comment.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="border p-1 rounded w-full"
                      placeholder="Edit your comment..."
                    />
                    <button
                      onClick={() => handleSaveButtonClick(comment.id)} 
                      className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelButtonClick} 
                      className="border border-gray-200 bg-white text-gray-600 px-3 py-1 rounded mb-2 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <p>{comment.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditButtonClick(comment.id, comment.text)} // Set the current text to edit
                        className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition"
                        >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                                
                      <button 
                        onClick={() => handleDeleteButtonClick(comment.id)}
                        className="border border-pink-200 bg-white text-pink-600 px-3 py-1 rounded mb-2 hover:bg-red-50 transition"
                        >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                 )}
                </li>
                ))
            ) : (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
            </ul>



            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
              <input
                type="text"
                name="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="border p-2 flex-1 rounded"
              />
              <button
                type="submit"
                className="bg-red-200 text-pink-600 px-4 py-2 rounded-lg shadow-md hover:bg-red-300 transition"
              >
                Comment
              </button>
            </form>
        
          </div>
        </>
      ) : (
        <p>Post not found</p>
      )}
    </div>
  );
}
