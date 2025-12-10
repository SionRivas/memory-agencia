// /app/api/route.ts
export async function GET() {
  // Accede a la variable de entorno en el servidor
  const awsKey = process.env.AWS_REGION ?? "NO_DEFINIDA";

  return new Response(awsKey, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
