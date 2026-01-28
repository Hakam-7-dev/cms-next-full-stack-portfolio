"use client";
import Link from "next/link";
import { useEffect, useReducer, useState } from "react";
import { supabase } from "@/lib/supabase/user";
interface Blog {
  id: string;
  title: string;
  description?: string;
}

interface BlogState {
  blogs: Blog[];
  isFetching: boolean;
}

type BlogAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Blog[] }
  | { type: "FETCH_ERROR" };

function blogReducer(state: BlogState, action: BlogAction): BlogState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isFetching: true };
    case "FETCH_SUCCESS":
      return { blogs: action.payload, isFetching: false };
    case "FETCH_ERROR":
      return { blogs: [], isFetching: false };
    default:
      return state;
  }
}

export default function BlogsPage() {
  const [state, dispatch] = useReducer(blogReducer, { blogs: [], isFetching: true });

  const blogsTags = [
    {
      label: "HTML",
      value: "HTML",
      name: "HTML"
    }
  ]


  useEffect(() => {
    const fetchBlogs = async () => {
      dispatch({ type: "FETCH_START" });
      const { data, error } = await supabase.from("blogs").select("*");
      if (error) {
        dispatch({ type: "FETCH_ERROR" });
        console.error(error);
      } else {
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      }
    };

    fetchBlogs();
  }, []);

  if (state.isFetching) return <p>Loading blogs...</p>;
  if (state.blogs.length === 0) return <p>No blogs found.</p>;

  return (
     
    <div className="space-y-4">
      {state.blogs.map(blog => (
        <Link
          key={blog.id}
          href={`/admin/blogs/${blog.id}`} // Clicking goes to update form
          className="block text-xl font-bold text-blue-500 hover:underline"
        >
          {blog.title}
        </Link>
      ))}
    </div>
  );
}
