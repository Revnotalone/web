export const COOKIE = "aipi_admin";

export async function adminToken(): Promise<string> {
  const raw = `${process.env.ADMIN_PASSWORD || ""}|${process.env.AUTH_SECRET || ""}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
