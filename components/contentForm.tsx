'use client';

import { useState, useReducer, useMemo, useCallback } from "react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor, RenderElementProps } from "slate-react";
import { withHistory, HistoryEditor } from "slate-history";
import { supabase } from "@/lib/supabase/user"; 
import { Textarea } from "@/components/ui/textarea";

// ----- Types -----
type CustomText = { text: string };
type ParagraphElement = { type: "paragraph"; children: CustomText[] };
type HeadingElement = { type: "heading"; children: CustomText[] };
type CustomElement = ParagraphElement | HeadingElement;
type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;
type CustomDescendant = CustomText | CustomElement;

interface ContentFormProps {
  variant: 'blogs' | 'projects';
}

interface BlogInputState {
  title: string;
  description?: string;
}

const defaultContent: CustomDescendant[] = [];

export default function ContentForm({ variant }: ContentFormProps) {
  const [blogInput, setBlogInput] = useReducer(
    (prev: BlogInputState, next: Partial<BlogInputState>) => ({ ...prev, ...next }),
    { title: "", description: "" }
  );

  const [value, setValue] = useState<Descendant[]>(defaultContent);
  const [loading, setLoading] = useState(false);

  const editor = useMemo(() => withHistory(withReact(createEditor() as CustomEditor)), []);

  // --- Submit form ---
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const titleTrimmed = blogInput.title.trim();
    if (!titleTrimmed) return alert("Title is required");

    setLoading(true);
    try {
      const table = variant === 'blogs' ? 'blogs' : 'projects';
      const { error } = await supabase
        .from(table)
        .insert([{ title: titleTrimmed, description: blogInput.description, content: value }]);
      if (error) throw error;

      alert(`${variant === 'blogs' ? 'Blog' : 'Project'} created successfully!`);
      setBlogInput({ title: "", description: "" });
      setValue(defaultContent);
    } catch(err) {
      if(err instanceof Error) alert('Error creating content: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [blogInput, value, variant]);

  // --- Slate element renderer ---
  const renderElement = useCallback((props: RenderElementProps) => {
    const { element, attributes, children } = props;
    const el = element as CustomElement;
    switch(el.type){
      case "heading": return <h2 {...attributes} className="text-2xl font-bold my-2">{children}</h2>;
      case "paragraph":
      default: return <p {...attributes} className="my-2">{children}</p>;
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-1 px-7">
      <h1 className="text-2xl font-bold mb-6">Create New {variant === 'blogs' ? 'Blog' : 'Project'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={blogInput.title}
            onChange={e => setBlogInput({ title: e.target.value })}
            placeholder={variant === 'blogs' ? "Blog Title" : "Project Title"}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <Textarea
            value={blogInput.description ?? ""}
            onChange={e => setBlogInput({ description: e.target.value })}
            placeholder="Description..."
            className="border p-2 w-full rounded min-h-[200px]"
          />
        </div>


        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : `Create ${variant === 'blogs' ? 'Blog' : 'Project'}`}
        </button>

      </form>
    </div>
  );
}
