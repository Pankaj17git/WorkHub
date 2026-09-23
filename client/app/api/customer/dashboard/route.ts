import { customerController } from "@/controller/customer/customer.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return customerController.dashboard(request);
}