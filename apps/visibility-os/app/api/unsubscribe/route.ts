import { db } from "@/lib/db";
import { isValidUnsubscribeToken } from "@/lib/unsubscribe";
import { appUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#07160E;color:#FAF7F2;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px"><div><h1 style="font-weight:300;font-size:28px;margin:0 0 12px">${title}</h1><p style="color:rgba(250,247,242,.6);max-width:380px;margin:0 auto 24px">${body}</p><a href="${appUrl()}/dashboard" style="color:#C9A96E">Go to your dashboard</a></div></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

function params(req: Request) {
  const url = new URL(req.url);
  return { userId: url.searchParams.get("u") ?? "", token: url.searchParams.get("t") ?? "" };
}

const invalid = () =>
  page(
    "This link is not valid",
    "It may be old or incomplete. Message us on WhatsApp and we will switch it off for you.",
    400
  );

// GET only shows a confirm button: mail scanners and link previewers open
// links automatically, and that must not unsubscribe anyone. The change is
// made by POST, which is also what mail clients send for one-click
// unsubscribe (RFC 8058).
export async function GET(req: Request) {
  const { userId, token } = params(req);
  if (!userId || !isValidUnsubscribeToken(userId, token)) return invalid();
  const action = `/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(token)}`;
  return page(
    "Stop the weekly email?",
    `<form method="post" action="${action}"><button type="submit" style="background:#C9A96E;color:#07160E;border:0;padding:12px 24px;font-size:13px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer">Yes, unsubscribe me</button></form>`
  );
}

export async function POST(req: Request) {
  const { userId, token } = params(req);

  if (!userId || !isValidUnsubscribeToken(userId, token)) return invalid();

  try {
    await db.user.update({ where: { id: userId }, data: { digestOptOut: true } });
  } catch {
    return page("We could not update that", "Please try again in a minute, or message us on WhatsApp.", 500);
  }
  return page("You are unsubscribed", "You will not get the weekly email any more. Your scores still update in your dashboard.");
}
