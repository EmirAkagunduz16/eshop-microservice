import { PrismaClient } from "@prisma/client";

declare global {
  namespace globalThis {
    /*eslint no-var: "off"*/
    var prismadb: PrismaClient;
  }
}

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") global.prismadb = prisma;

export default prisma;
