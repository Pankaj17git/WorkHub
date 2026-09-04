import { NextRequest } from "next/server";
import { addressController } from "@/controller/address.controller";

export async function POST(request: NextRequest) {
  return addressController.addAddress(request);
}

export async function GET(request: NextRequest) {
  return addressController.getAddress(request);
}
