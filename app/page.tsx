'use client';

import Link from "next/link";
import { BookOpenIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export default function AdminHome() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your blogs and projects from here.
        </p>
      </div>

      {/* Cards / Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blogs Card */}
        <Link
          href="/admin/blogs"
          className="flex items-center p-6 bg-white border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        >
          <BookOpenIcon className="h-12 w-12 text-blue-500 mr-4" />
          <div>
            <h2 className="text-xl font-bold">Blogs</h2>
            <p className="text-gray-500 mt-1">Create, edit, and manage all your blogs.</p>
          </div>
        </Link>

        {/* Projects Card */}
        <Link
          href="/admin/projects"
          className="flex items-center p-6 bg-white border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        >
          <BriefcaseIcon className="h-12 w-12 text-green-500 mr-4" />
          <div>
            <h2 className="text-xl font-bold">Projects</h2>
            <p className="text-gray-500 mt-1">Create, edit, and manage all your projects.</p>
          </div>
        </Link>
      </div>

      {/* Optional Footer / Info */}
      <div className="mt-12 text-gray-400 text-sm">
        <p>Click on a section to start managing your content. All changes are saved automatically.</p>
      </div>
    </main>
  );
}
