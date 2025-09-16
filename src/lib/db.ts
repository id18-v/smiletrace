// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Export default pentru compatibilitate cu auth.ts
export default prisma;

// Export named pentru alte cazuri

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;




///////////////////////////////////////////////////