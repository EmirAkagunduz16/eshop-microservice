import { PrismaClient } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace globalThis {
    /*eslint no-var: "off"*/
    var prismadb: PrismaClient;
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") global.prismadb = prisma;

export default prisma;
