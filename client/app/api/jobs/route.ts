import { JobController } from "@/controller/jobs/createJob.controller";
import { geoController } from "@/controller/geo.controller";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return JobController.createJob(request);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.has("lat") || searchParams.has("latitude")) {
    return geoController.findNearbyJobs(request);
  }
  return JobController.getjobs(request);
}
