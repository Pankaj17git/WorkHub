import { JobController } from "@/controller/jobs/createJob.controller";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return JobController.updateJobStatus(request, id);
}

