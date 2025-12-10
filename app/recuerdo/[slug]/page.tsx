export default async function RecuerdoPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const recuerdo = await obtenerRecuerdoPorSlug(slug);

  if (!recuerdo) {
    return <h1>Recuerdo no encontrado</h1>;
  }

  return (
    <div>
      <h1>{recuerdo.titulo}</h1>
      <p>{recuerdo.contenido}</p>
    </div>
  );
}

async function obtenerRecuerdoPorSlug(slug: string) {
  if (slug === "mi-primer-viaje") {
    return {
      titulo: "Mi Primer Viaje a la Playa",
      contenido: "El agua estaba fría pero el sol radiante.",
      id_secreto_db: "XYZ123", // Esto NO se envía al cliente
    };
  }
  return null;
}
