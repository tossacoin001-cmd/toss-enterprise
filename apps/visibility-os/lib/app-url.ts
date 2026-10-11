/** Public origin used in emails and links. Override per environment with APP_URL. */
export function appUrl(): string {
  const url = process.env.APP_URL?.trim();
  return (url && url !== "" ? url : "https://tossvisibilityos.com").replace(/\/+$/, "");
}
