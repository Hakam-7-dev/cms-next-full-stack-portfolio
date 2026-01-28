import { createClient } from "@/lib/supabase/server";
import { url } from "inspector";
import { headers } from "next/headers";
export async function POST(req: Request){
    const bucketName = 'images'
    const supabase = await createClient();
    const file = await req.blob();
    const header = headers();
    const filename = (await header).get("X-Vercel-Filename");

    await supabase.storage.from(bucketName).upload(filename, file);
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filename)
    
    return Response.json({
        url: data.publicUrl,

    })
}