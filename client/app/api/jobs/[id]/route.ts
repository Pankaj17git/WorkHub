import { JobController } from "@/controller/jobs/createJob.controller";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return JobController.getJobById(request, id);
}
