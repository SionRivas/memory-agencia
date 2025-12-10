import { prisma } from "@/lib/prisma";

// /app/api/route.ts
export async function GET() {
  const test = await prisma.memorial.findFirst();

  return new Response(test ? JSON.stringify(test) : "No data found", {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
