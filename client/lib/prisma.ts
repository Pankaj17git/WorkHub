import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

if (!("toJSON" in BigInt.prototype)) {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function () {
      return this.toString();
    },
    writable: true,
    configurable: true,
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  adapter?: PrismaMariaDb;
};

export const adapter =
  globalForPrisma.adapter ||
  new PrismaMariaDb({
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    port: Number(process.env.DATABASE_PORT),
    connectionLimit: 5,
  });

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.adapter = adapter;
  globalForPrisma.prisma = prisma;
}

export { prisma };