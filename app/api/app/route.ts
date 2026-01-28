import { createClient } from "@/lib/supabase/client";
export async function GET(){
    const supabase = createClient();
    const {count: projectsCount} = await supabase.from("projects").select("*", {count: "exact", head: true});
    const {count: blogsCount} = await supabase.from("blogs").select("*", {count: "exact", head: true});
return Response.json({
    project: projectsCount,
    blogs: blogsCount
})
}