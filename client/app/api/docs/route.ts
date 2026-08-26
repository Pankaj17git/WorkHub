import { docsController } from "@/controller/docs.controller";

export async function GET() {
  return docsController.getDocs();
}
