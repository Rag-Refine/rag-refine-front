/**
 * Computes a SHA-256 hex digest of an ArrayBuffer.
 * Uses the standard Web Crypto API — works in browsers, Node 18+, and Edge runtime.
 */
export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
