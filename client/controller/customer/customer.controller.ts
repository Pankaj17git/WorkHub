import { Prisma } from "@/generated/prisma/client";
import { authMiddleware } from "@/middleware/auth.middleware";
import { NextRequest, NextResponse } from "next/server";
import { status } from "@/constants/statusCodes";
import { prisma } from "@/lib/prisma";


export const customerController = {

  async dashboard(request:NextRequest){
    try {
      const userId = authMiddleware(request);
      if (userId === null) {
        return NextResponse.json({ error: "Unauthorized" }, { status: status.UNAUTHORIZED });
      }

      const customer = await prisma.user.findUnique({
        where: { id: userId },
        include:{
          customer:true
        }
      });
      if(!customer || !customer.customer){
        return NextResponse.json({ error: "Customer not found" }, { status: status.NOT_FOUND });
      }
      const jobs = await prisma.job.findMany({
        where: { customerId: customer.customer.id },
        include:{
          customer:true
        }
      });

      const counts = jobs.reduce(
        (acc, job) => {
          acc.totalJobs++;

          switch (job.status) {
            case "OPEN":
              acc.openJobs++;
              break;
            case "SCHEDULED":
              acc.activeBooking++;
              break;
            case "IN_PROGRESS":
              acc.activeBooking++;
              break;
            case "COMPLETED":
              acc.completedJobs++;
              acc.totalSpent += Number(job.maxAmount);
              break;
            case "CANCELLED":
              acc.cancelledJobs++;
              break;
          }

          return acc;
        },
        {
          totalJobs: 0,
          openJobs: 0,
          activeBooking: 0,
          completedJobs: 0,
          cancelledJobs: 0,
          totalSpent:0,
        }
      );

      return NextResponse.json({ customer, jobs, ...counts }, { status: status.OK });
    } catch (error) {
      console.log(error)
      return NextResponse.json({ error: "Internal Server Error" }, { status: status.INTERNAL_SERVER_ERROR });
    }
  }
  
}