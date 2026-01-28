import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const bucketName = "images";
  const supabase = await createClient();

  // Read file from request
  const file = await req.blob();

  // Get headers (synchronous)
  const headerList = await headers();
  const filename = headerList.get("X-Vercel-Filename");

  // Check if filename exists
  if (!filename) {
    return new Response(
      JSON.stringify({ error: "Filename header is missing" }),
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filename, file);

  if (uploadError) {
    return new Response(
      JSON.stringify({ error: uploadError.message }),
      { status: 500 }
    );
  }

  // Get public URL
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filename);

  return new Response(JSON.stringify({ url: data.publicUrl }), {
    status: 200,
  });
}
