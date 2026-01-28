"use client";

import { useEffect, useReducer, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { BounceLoader } from "react-spinners";
import { Trash } from "lucide-react";
import {
  ReloadIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import debounce from "lodash.debounce";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* =======================
   Types
======================= */

interface Blog {
  id: string;
  title: string;
  description?: string;
  content: string;
}

interface BlogState {
  blogs: Blog[];
  isFetching: boolean;
  searchTerm: string;
  currentPage: number;
}

type BlogAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Blog[] }
  | { type: "FETCH_ERROR" }
  | { type: "DELETE_SUCCESS"; payload: string }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_PAGE"; payload: number };

const BLOGS_PER_PAGE = 3;

/* =======================
   Reducer
======================= */

function blogReducer(state: BlogState, action: BlogAction): BlogState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isFetching: true };

    case "FETCH_SUCCESS":
      return {
        ...state,
        blogs: action.payload,
        isFetching: false,
        currentPage: 1,
      };

    case "FETCH_ERROR":
      return { ...state, blogs: [], isFetching: false };

    case "DELETE_SUCCESS":
      return {
        ...state,
        blogs: state.blogs.filter((b) => b.id !== action.payload),
      };

    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };

    case "SET_PAGE":
      return { ...state, currentPage: action.payload };

    default:
      return state;
  }
}

/* =======================
   Component
======================= */

export default function BlogsPage() {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [state, dispatch] = useReducer(blogReducer, {
    blogs: [],
    isFetching: true,
    searchTerm: "",
    currentPage: 1,
  });

  /* =======================
     Fetch blogs
  ======================= */

  const fetchBlogs = async (term: string = ""): Promise<void> => {
    dispatch({ type: "FETCH_START" });

    try {
      const url = term
        ? `/api/blogs?term=${encodeURIComponent(term)}`
        : "/api/blogs";

      const res = await fetch(url);
      const json: { data: Blog[] } = await res.json();

      dispatch({ type: "FETCH_SUCCESS", payload: json.data ?? [] });
    } catch {
      dispatch({ type: "FETCH_ERROR" });
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* =======================
     Search (debounced)
  ======================= */

  const debouncedFetch = useCallback(
    debounce((term: string) => fetchBlogs(term), 600),
    [],
  );

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const term = e.target.value;
    dispatch({ type: "SET_SEARCH_TERM", payload: term });
    debouncedFetch(term);
  };

  /* =======================
     Pagination
  ======================= */

  const totalPages = Math.ceil(state.blogs.length / BLOGS_PER_PAGE);

  const paginatedBlogs = useMemo(() => {
    const start = (state.currentPage - 1) * BLOGS_PER_PAGE;
    return state.blogs.slice(start, start + BLOGS_PER_PAGE);
  }, [state.blogs, state.currentPage]);

  const goPrev = (): void => {
    if (state.currentPage > 1) {
      dispatch({ type: "SET_PAGE", payload: state.currentPage - 1 });
    }
  };

  const goNext = (): void => {
    if (state.currentPage < totalPages) {
      dispatch({ type: "SET_PAGE", payload: state.currentPage + 1 });
    }
  };

  /* =======================
     Delete blog
  ======================= */

  const deleteBlog = async (id: string): Promise<void> => {
    setDeletingId(id);

    try {
      const res = await fetch("/api/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Delete failed");

      dispatch({ type: "DELETE_SUCCESS", payload: id });
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================
     UI states
  ======================= */

  if (state.isFetching) return <BounceLoader className="mx-auto" />;

  if (state.blogs.length === 0) return <h1>No blogs found</h1>;

  /* =======================
     Render
  ======================= */

  return (
    <div>
      <h2 className="font-bold text-2xl mb-5">Blogs</h2>

      <Label className="relative mb-8 block w-full">
        <MagnifyingGlassIcon className="absolute left-2 top-2.5" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-7"
          value={state.searchTerm}
          onChange={handleSearchChange}
        />
      </Label>

      <div className="space-y-4">
        {paginatedBlogs.map((blog) => (
          <div
            key={blog.id}
            className="flex justify-between group border p-4 rounded hover:bg-gray-100"
          >
            <div>
              <Link
                href={`/admin/blogs/${blog.id}`}
                className="block text-xl text-blue-400 font-bold"
              >
                {blog.title}
              </Link>
              <p className="text-sm text-gray-400 mt-1">
                {blog.description ?? "No description"}
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="opacity-0 group-hover:opacity-70"
                >
                  <Trash />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete confirmation</DialogTitle>
                  <DialogDescription>
                    Delete <b>{blog.title}</b>?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button
                    variant="destructive"
                    onClick={() => deleteBlog(blog.id)}
                    disabled={deletingId === blog.id}
                  >
                    {deletingId === blog.id ? (
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button onClick={goPrev} disabled={state.currentPage === 1}>
          <ArrowLeftIcon />
        </Button>

        <span className="text-sm text-gray-500">
          Page {state.currentPage} of {totalPages}
        </span>

        <Button
          onClick={goNext}
          disabled={state.currentPage === totalPages}
        >
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  );
}
