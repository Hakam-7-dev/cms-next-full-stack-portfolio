'use client';

import { useState, useReducer, useCallback, useEffect } from "react";
import { Descendant} from "slate";
import { useRouter, useParams } from "next/navigation";

// --- Types ---

interface ProjectInputState {
  title: string;
  description?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  content: Descendant[] | string;
}

// --- Default Slate content ---
const defaultContent = [{ type: "paragraph", children: [{ text: "" }] }];

export default function BlogForm() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const projectId = params?.slug?.toString();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<Project | null>(null);

  const [projectInput, setProjectInput] = useReducer(
    (prev: ProjectInputState, next: Partial<ProjectInputState>) => ({ ...prev, ...next }),
    { title: "", description: "" }
  );

  const [value, setValue] = useState<Descendant[]>(defaultContent);


  // --- Fetch blog/project data ---
  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects?id=${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");

        const json: { data?: Project; error?: string } = await res.json();
        if (!json.data) throw new Error(json.error || "Project not found");

        setInitialData(json.data);
        setProjectInput({
          title: json.data.title,
          description: json.data.description ?? "",
        });

        const contentData: Descendant[] =
          typeof json.data.content === "string"
            ? JSON.parse(json.data.content) as Descendant[]
            : json.data.content ?? defaultContent;

        setValue(contentData);
      } catch (err: unknown) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // --- Slate render element ---
  // const renderElement = useCallback((props: RenderElementProps) => {
  //   const { element, attributes, children } = props;
  //   const el = element as CustomElement;

  //   switch (el.type) {
  //     case "heading":
  //       return <h2 {...attributes} className="text-2xl font-bold my-2">{children}</h2>;
  //     case "image":
  //       return (
  //         <img
  //           {...attributes}
  //           src={el.url}
  //           alt=""
  //           className="my-4 max-w-full rounded"
  //         />
  //       );
  //     default:
  //       return <p {...attributes} className="my-2">{children}</p>;
  //   }
  // }, []);

  // --- Handle project/blog update ---
  const handleUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!projectId) return alert("Project ID missing");
      if (!projectInput.title.trim()) return alert("Project title is required");

      const contentText = value
        .map(node => ("children" in node ? node.children.map(c => c).join("") : ""))
        .join("")
        .trim();

      if (!contentText) return alert("Content cannot be empty");

      try {
        const res = await fetch(`/api/projects?id=${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...projectInput,
            content: JSON.stringify(value),
          }),
        });

        const result: { error?: string } = await res.json();
        if (!res.ok) throw new Error(result.error ?? "Failed to update project");

        router.push("/admin/projects");
      } catch (err: unknown) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
    [projectInput, value, projectId, router]
  );

  if (loading) return <p>Loading...</p>;
  if (!initialData) return <p>Project not found</p>;

  return (
    <form onSubmit={handleUpdate} className="space-y-4 w-full">
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          value={projectInput.title}
          onChange={e => setProjectInput({ title: e.target.value })}
          placeholder="Project Title"
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          value={projectInput.description ?? ""}
          onChange={e => setProjectInput({ description: e.target.value })}
          placeholder="Short description"
          className="border p-2 w-full rounded min-h-[300px]"
        />
      </div>


      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Blog
      </button>
    </form>
  );
}
