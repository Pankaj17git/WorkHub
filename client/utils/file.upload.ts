import { randomUUID } from "crypto";

export function generateKey() {
  const key = `${randomUUID()}`;
  return key;
}

export function extractKeyFromUrl(url: string): string {
  const key = url.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  )?.[0];
  if (!key) {
    throw new Error("Invalid URL format");
  }
  return key;
}
