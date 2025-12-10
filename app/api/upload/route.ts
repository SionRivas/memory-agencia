// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// 1. Configurar el cliente de S3 con tus variables de entorno
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    // 2. Obtener el tipo de archivo (ej: image/jpeg) y el nombre original del frontend
    const { fileType, fileName } = await request.json();

    // 3. Crear un nombre único para el archivo (ej: 123-abc-foto.jpg)
    // Esto es vital para no sobrescribir archivos con el mismo nombre
    const uniqueFileName = `${uuidv4()}-${fileName}`;

    // 4. Preparar el comando de subida
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType, // Importante para que el navegador sepa que es una imagen
    });

    // 5. Generar la URL firmada (valida por 60 segundos)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // 6. Devolver la URL al frontend junto con la URL final donde quedará la foto
    return NextResponse.json({
      uploadUrl, // URL temporal para subir (PUT)
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`, // URL pública para ver (GET)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creando la URL de subida" },
      { status: 500 }
    );
  }
}
