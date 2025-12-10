import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// 1. Definimos una función única para crear la instancia
const prismaClientSingleton = () => {
  const adapter = new PrismaLibSql({
    url: `${process.env.TURSO_DATABASE_URL}`,
    authToken: `${process.env.TURSO_AUTH_TOKEN}`,
  });

  return new PrismaClient({ adapter });
};

// 2. Declaramos el tipo global
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 3. Lógica del Singleton: Si ya existe en global úsalo, si no, créalo.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

// 4. Solo en desarrollo guardamos la referencia global
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
