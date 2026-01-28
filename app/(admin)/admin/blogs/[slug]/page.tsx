'use client';

import { useState, useReducer, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// --- Types ---
interface BlogInputState {
  title: string;
  description?: string;
}

interface Blog {
  id: string;
  title: string;
  description?: string;
}

// --- Default state ---
const defaultBlogInput: BlogInputState = {
  title: "",
  description: "",
};

export default function BlogForm() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const blogId = params?.slug?.toString();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Blog | null>(null);

  const [blogInput, setBlogInput] = useReducer(
    (prev: BlogInputState, next: Partial<BlogInputState>) => ({ ...prev, ...next }),
    defaultBlogInput
  );

  // --- Fetch blog data if editing ---
  useEffect(() => {
    if (!blogId) {
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/blogs?id=${blogId}`);
        if (!res.ok) throw new Error("Failed to fetch blog");

        const json: { data?: Blog; error?: string } = await res.json();
        if (!json.data) throw new Error(json.error || "Blog not found");

        setInitialData(json.data);
        setBlogInput({
          title: json.data.title,
          description: json.data.description ?? "",
        });
      } catch (err: unknown) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  // --- Handle update ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogId) return alert("Blog ID missing");
    if (!blogInput.title.trim()) return alert("Title is required");

    try {
      const res = await fetch(`/api/blogs?id=${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogInput),
      });

      const result: { error?: string } = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Failed to update blog");

      router.push("/admin/blogs");
    } catch (err: unknown) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (blogId && !initialData) return <p>Blog not found</p>;

  return (
    <form onSubmit={handleUpdate} className="space-y-4 w-full">
      {/* Title */}
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          value={blogInput.title}
          onChange={e => setBlogInput({ title: e.target.value })}
          placeholder="Blog Title"
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          value={blogInput.description ?? ""}
          onChange={e => setBlogInput({ description: e.target.value })}
          placeholder="Short description"
          className="border p-2 w-full rounded min-h-[200px]"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Blog
      </button>
    </form>
  );
}
