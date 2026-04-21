import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Simply pass everything through without auth checks
  return NextResponse.next({
    request,
  });
}