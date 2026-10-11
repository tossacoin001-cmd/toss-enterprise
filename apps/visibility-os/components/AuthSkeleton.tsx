/** Shown while Clerk's script loads, so the page is never an empty box. */
export default function AuthSkeleton() {
  const bar = (w: string, h = "h-3") => (
    <div className={`${h} ${w} rounded`} style={{ background: "rgba(9,45,34,0.12)" }} />
  );
  return (
    <div
      role="status"
      aria-label="Loading the form"
      className="w-full rounded-xl p-8 space-y-5 animate-pulse"
      style={{ background: "#FAF7F2", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
    >
      <div className="space-y-2 text-center flex flex-col items-center">
        {bar("w-2/5", "h-5")}
        {bar("w-3/5")}
      </div>
      {bar("w-full", "h-10")}
      {bar("w-full", "h-10")}
      {bar("w-full", "h-10")}
      {bar("w-full", "h-11")}
    </div>
  );
}
