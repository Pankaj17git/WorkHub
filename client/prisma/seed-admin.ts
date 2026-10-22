import "dotenv/config";
import bcrypt from "bcryptjs";
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

async function main(): Promise<void> {
  // 1. Ensure ADMIN role exists in roles table
  let adminRole = await prisma.role.findFirst({
    where: { type: UserRole.ADMIN },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { type: UserRole.ADMIN },
    });
    console.log("Created ADMIN role");
  }

  // 2. Ensure default admin user exists
  const adminEmail = "admin@workhub.com";
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  if (!existingUser) {
    const created = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "WorkHub SuperAdmin",
        password: passwordHash,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        roleId: adminRole.id,
      },
    });
    console.log(`Created admin user: ${created.email} (Password: Admin@123)`);
  } else {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        roleId: adminRole.id,
        status: "ACTIVE",
        password: passwordHash,
      },
    });
    console.log(`Updated existing admin user: ${existingUser.email} (Password: Admin@123)`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Admin seeding completed successfully.");
  })
  .catch(async (e) => {
    console.error("Admin seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
