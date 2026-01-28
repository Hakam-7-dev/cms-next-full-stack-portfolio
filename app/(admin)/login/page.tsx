import { LoginForm } from "@/components/login-form";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
const supabaseUrl = "https://mfucmzhbcrvmgrexazdw.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdWNtemhiY3J2bWdyZXhhemR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNTIyODUsImV4cCI6MjA4NDcyODI4NX0.cdnzFUy8WX7Rmf4TikMqI5pG_EF3IasPFSvb3icJ4dA"; // Replace with your anon key
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gray-300">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  redirect("/admin");
} 
