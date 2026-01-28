"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  FileTextIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import clsx from "clsx";

 function AdminSidebar() {
  const pathname = usePathname();

  const linkClass = (href: string): string =>
    clsx(
      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
      pathname === href
        ? "bg-black text-white" 
        : "hover:text-white hover:bg-zinc-600"
    );

  return (
    <nav className="py-8 px-6">
      <ul className="space-y-2">
        <li>
          <Link href="/admin" className={linkClass("/admin")}>
            <HomeIcon />
            Home
          </Link>
        </li>

        <li>
          <Link href="/admin/projects" className={linkClass("/admin/projects")}>
            <DashboardIcon />
            Projects
          </Link>
        </li>

        <li>
          <Link href="/admin/blogs" className={linkClass("/admin/blogs")}>
            <FileTextIcon />
            Blogs
          </Link>
        </li>
      </ul>
    </nav>
  );
}
export default AdminSidebar;