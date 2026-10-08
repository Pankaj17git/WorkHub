import { customerController } from "@/controller/customer/customer.controller";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return customerController.dashboard(request);
}