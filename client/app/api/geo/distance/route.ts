import { NextRequest } from "next/server";
import { geoController } from "@/controller/geo.controller";

export async function POST(request: NextRequest) {
  return geoController.calculateDistance(request);
}
