import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { count } from "console";

const tableName = "blogs";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const term = searchParams.get("term") ?? "";
    const page = parseInt(searchParams.get("page") || '0');
    const limit = parseInt(searchParams.get("limit") || '20');
    const from = page * limit;
    const to = from + limit;

    // Fetch single blog
    if (id) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error)
        return NextResponse.json({ error: error.message }, { status: 404 });

      return NextResponse.json({ data });
    }

    // Fetch all blogs, optionally filtered by search term
    let query = supabase.from(tableName).select("*");

    if (term) {
      query = query.ilike("title", `%${term}%`).range(from, to);
    }

    const { data, error, count } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data ?? [],
      total: count ?? 0,
      page,
      limit
     });
  } catch (err) {
    console.error("GET /api/blogs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    if (!body.title) body.title = "New Blog";
    if (!body.content) body.content = "[]";
    if (!body.description) body.description = "";

    const { data, error } = await supabase
      .from(tableName)
      .insert([body])
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/blogs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });

    const { data, error } = await supabase
      .from(tableName)
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("PATCH /api/blogs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const id = body.id;

    if (!id)
      return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });

    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/blogs error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
