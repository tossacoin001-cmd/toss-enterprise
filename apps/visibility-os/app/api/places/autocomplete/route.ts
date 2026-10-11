import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { autocompletePlaces } from "@/lib/google-places";

const querySchema = z.object({
  input: z.string().trim().min(2).max(120),
  sessionToken: z.string().trim().min(1).max(100),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = querySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await autocompletePlaces(parsed.data.input, parsed.data.sessionToken);
  return NextResponse.json({ suggestions });
}
