// app/api/memorials/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface ImageData {
    url: string;
    caption: string;
}

interface CreateMemorialRequest {
    title: string;
    slug: string;
    description?: string;
    youtubeVideoId?: string;
    images: ImageData[];
}

export async function POST(request: Request) {
    try {
        const body: CreateMemorialRequest = await request.json();
        const { title, slug, description, youtubeVideoId, images } = body;

        // Validación básica
        if (!title || !slug) {
            return NextResponse.json(
                { error: "Título y slug son requeridos" },
                { status: 400 }
            );
        }

        // Verificar que el slug no existe
        const existingMemorial = await prisma.memorial.findUnique({
            where: { slug },
        });

        if (existingMemorial) {
            return NextResponse.json(
                { error: "Ya existe un recuerdo con ese slug" },
                { status: 409 }
            );
        }

        // Generar UUID para el memorial
        const memorialId = uuidv4();

        // Crear el memorial con sus imágenes
        const memorial = await prisma.memorial.create({
            data: {
                id: memorialId,
                title,
                slug,
                description: description || null,
                youtubeVideoId: youtubeVideoId || null,
                gallery: {
                    create: images.map((img) => ({
                        id: uuidv4(),
                        url: img.url,
                        caption: img.caption || null,
                    })),
                },
            },
            include: {
                gallery: true,
            },
        });

        return NextResponse.json({
            success: true,
            memorial: {
                ...memorial,
                fotos: memorial.gallery.map((img) => ({
                    url: img.url,
                    caption: img.caption || "",
                })),
            },
        });
    } catch (error) {
        console.error("Error creando memorial:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
