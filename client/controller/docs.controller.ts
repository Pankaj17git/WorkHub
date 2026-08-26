import { NextResponse } from "next/server";
import swaggerSpec from "@/lib/swagger";

export const docsController = {
  async getDocs() {
    return NextResponse.json(swaggerSpec);
  },
};
