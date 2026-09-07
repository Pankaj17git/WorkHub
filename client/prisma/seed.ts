import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, UserRole } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const ROLES: UserRole[] = [UserRole.CUSTOMER, UserRole.WORKER];

async function main() {
  for (const roleType of ROLES) {
    const existing = await prisma.role.findFirst({
      where: { type: roleType },
    });

    if (!existing) {
      await prisma.role.create({
        data: { type: roleType },
      });
    }
  }
}

main()
  .then(() => {
    console.log("Roles seeded:", ROLES.join(", "));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
