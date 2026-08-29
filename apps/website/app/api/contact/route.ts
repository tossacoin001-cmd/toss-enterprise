import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { resend, CONTACT_NOTIFY_EMAIL, CONTACT_FROM_EMAIL } from "@/lib/resend";

type ContactPayload = {
  name: string;
  business?: string;
  email: string;
  service?: string;
  budget?: string;
  message?: string;
};

function isValidPayload(json: unknown): json is ContactPayload {
  if (typeof json !== "object" || json === null) return false;
  const { name, email } = json as Record<string, unknown>;
  return typeof name === "string" && name.trim().length > 0 && typeof email === "string" && email.includes("@");
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isValidPayload(json)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  const submission = {
    name: json.name.trim(),
    business: json.business?.trim() || null,
    email: json.email.trim(),
    service: json.service?.trim() || null,
    budget: json.budget?.trim() || null,
    message: json.message?.trim() || null,
    createdAt: new Date(),
  };

  // Persist first, best-effort: a failed write here shouldn't block the
  // email notification, which is the primary way leads reach us today.
  try {
    const db = await getDb();
    await db?.collection("contact_submissions").insertOne(submission);
  } catch (e) {
    console.error("[POST /api/contact] mongodb insert failed", e);
  }

  if (!resend) {
    console.error("[POST /api/contact] RESEND_API_KEY not configured, lead was only logged to the database");
    return NextResponse.json({ error: "Contact notifications are not configured" }, { status: 503 });
  }

  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_NOTIFY_EMAIL,
    replyTo: submission.email,
    subject: `New strategy call request: ${submission.name}${submission.business ? ` (${submission.business})` : ""}`,
    html: `
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Business:</strong> ${submission.business ?? "—"}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Service:</strong> ${submission.service ?? "—"}</p>
      <p><strong>Budget:</strong> ${submission.budget ?? "—"}</p>
      <p><strong>Message:</strong><br/>${(submission.message ?? "—").replace(/\n/g, "<br/>")}</p>
    `,
  });

  if (error) {
    console.error("[POST /api/contact] resend send failed", error);
    return NextResponse.json({ error: "Failed to send notification email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
