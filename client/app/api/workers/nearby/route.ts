import { NextRequest } from "next/server";
import { geoController } from "@/controller/geo.controller";

export async function GET(request: NextRequest) {
  return geoController.findNearbyWorkers(request);
}
