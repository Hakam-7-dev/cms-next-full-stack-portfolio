"use client";

import { useCallback, useEffect, useReducer, useState, useMemo } from "react";
import Link from "next/link";
import debounce from "lodash.debounce";
import { BounceLoader } from "react-spinners";
import { Trash } from "lucide-react";
import {
  ReloadIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/* =======================
   Types
======================= */

interface Project {
  id: string;
  title: string;
  description?: string;
  content: string;
}

interface ProjectState {
  projects: Project[];
  isFetching: boolean;
  searchTerm: string;
  currentPage: number;
}

type ProjectAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Project[] }
  | { type: "FETCH_ERROR" }
  | { type: "DELETE_SUCCESS"; payload: string }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_PAGE"; payload: number };

const PROJECTS_PER_PAGE = 3;

/* =======================
   Reducer
======================= */

function projectReducer(
  state: ProjectState,
  action: ProjectAction,
): ProjectState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isFetching: true };

    case "FETCH_SUCCESS":
      return {
        ...state,
        projects: action.payload,
        isFetching: false,
        currentPage: 1,
      };

    case "FETCH_ERROR":
      return { ...state, projects: [], isFetching: false };

    case "DELETE_SUCCESS":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };

    case "SET_SEARCH":
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

export default function ProjectsPage(){
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [state, dispatch] = useReducer(projectReducer, {
    projects: [],
    isFetching: true,
    searchTerm: "",
    currentPage: 1,
  });

  /* =======================
     Fetch projects
  ======================= */

  const fetchProjects = async (term: string = ""): Promise<void> => {
    dispatch({ type: "FETCH_START" });

    try {
      const res = await fetch(
        `/api/projects?term=${encodeURIComponent(term)}`,
      );

      const json: { data: Project[] } = await res.json();

      dispatch({ type: "FETCH_SUCCESS", payload: json.data ?? [] });
    } catch {
      dispatch({ type: "FETCH_ERROR" });
    }
  };

  /* =======================
     Debounced search
  ======================= */

  const debouncedFetch = useCallback(
    debounce((value: string) => {
      fetchProjects(value);
    }, 600),
    [],
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    debouncedFetch(state.searchTerm);
    return () => debouncedFetch.cancel();
  }, [state.searchTerm, debouncedFetch]);

  /* =======================
     Pagination
  ======================= */

  const totalPages = Math.ceil(
    state.projects.length / PROJECTS_PER_PAGE,
  );

  const paginatedProjects = useMemo<Project[]>(() => {
    const start = (state.currentPage - 1) * PROJECTS_PER_PAGE;
    return state.projects.slice(start, start + PROJECTS_PER_PAGE);
  }, [state.projects, state.currentPage]);

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
     Delete project
  ======================= */

  const deleteProject = async (id: string): Promise<void> => {
    setDeletingId(id);

    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      dispatch({ type: "DELETE_SUCCESS", payload: id });
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================
     UI states
  ======================= */

  if (state.isFetching) {
    return <BounceLoader className="mx-auto" />;
  }

  if (state.projects.length === 0) {
    return <h1>No projects found</h1>;
  }

  /* =======================
     Render
  ======================= */

  return (
    <div>
      <h2 className="font-bold text-2xl mb-5">Projects</h2>

      <Label className="relative mb-6 block">
        <MagnifyingGlassIcon className="absolute left-2 top-2.5" />
        <Input
          type="search"
          className="pl-7"
          placeholder="Search..."
          value={state.searchTerm}
          onChange={(e) =>
            dispatch({ type: "SET_SEARCH", payload: e.target.value })
          }
        />
      </Label>

      <div className="space-y-4">
        {paginatedProjects.map((project) => (
          <div
            key={project.id}
            className="flex justify-between border p-4 rounded group"
          >
            <div>
              <Link
                href={`/admin/projects/${project.id}`}
                className="text-blue-400 font-bold text-lg"
              >
                {project.title}
              </Link>

              <p className="text-sm text-gray-400">
                {project.description ?? "No description"}
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash />
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete project</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete{" "}
                    <b>{project.title}</b>?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button
                    variant="destructive"
                    onClick={() => deleteProject(project.id)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? (
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button onClick={goPrev} disabled={state.currentPage === 1}>
          <ArrowLeftIcon />
        </Button>

        <span>
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
