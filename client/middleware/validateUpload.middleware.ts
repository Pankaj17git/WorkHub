const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large");
  }
}