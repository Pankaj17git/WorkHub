import { JobController } from "@/controller/jobs/createJob.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return JobController.createJob(request);
}
