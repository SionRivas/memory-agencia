// app/api/upload/[key]/route.ts
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;

        // El key puede venir como URL completa o solo el nombre del archivo
        // Extraer solo el nombre del archivo si es una URL
        let fileKey = key;
        if (key.includes("s3.amazonaws.com/")) {
            fileKey = key.split("s3.amazonaws.com/").pop() || key;
        }

        // Decodificar el key (puede venir URL encoded)
        fileKey = decodeURIComponent(fileKey);

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error eliminando archivo de S3:", error);
        return NextResponse.json(
            { error: "Error eliminando archivo" },
            { status: 500 }
        );
    }
}
