

import { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MainLayout from "@/components/mainLayout";
import LogoutButton  from "@/components/auth-button";

import { PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NavigationHeadings from "@/components/NavigationHeadings";
import AdminSidebar from "@/components/SectionHovered";


export default async function AdminLayout({children,}: {children: ReactNode}) {

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="flex min-h-screen w-full">
      {/* ================= Left Sidebar ================= */}
      <aside className="w-56 border-r">
       <div className="border-b py-3 px-6">
         <h1 className="font-semibold text-2xl uppercase space-x-3">
          Portfolio 
        </h1>
        <h1 className="font-normal text-sm uppercase space-x-3 text-gray-400">
          ADMIN
        </h1>
       </div>

        <AdminSidebar />
      </aside>

      {/* ================= Main + Right ================= */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
       <div className="flex justify-between border-b px-6 py-3 items-center">
         <div className="flex py-3 px-10">
                <NavigationHeadings />

              </div>
         <header className="px-10">
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
              >
               
                <PlusCircleIcon className="h-4 w-4" />
                  <span className="me-2">Create</span>
              <div className="">
                  <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin/projects/create">Projects</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/blogs/create">Blogs</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app">
                <LogoutButton />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
       </div>
        {/* Page Content */}
        <MainLayout>{children}</MainLayout>
      </div>
    </div>
  );
}
