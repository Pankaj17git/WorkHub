import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, UserRole } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: 2,
});

const prisma = new PrismaClient({ adapter });

const ROLES: UserRole[] = [
  UserRole.CUSTOMER,
  UserRole.WORKER,
  UserRole.ADMIN,
  UserRole.CONTRACTOR,
];

async function main(): Promise<void> {
  for (const type of ROLES) {
    const existing = await prisma.role.findFirst({ where: { type } });
    if (!existing) {
      await prisma.role.create({ data: { type } });
      console.log(`Created role: ${type}`);
    } else {
      console.log(`Role exists: ${type}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Role seeding completed.");
  })
  .catch(async (e: unknown) => {
    console.error("Role seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });