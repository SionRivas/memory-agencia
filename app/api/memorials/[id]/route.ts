// app/api/memorials/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface ImageData {
    url: string;
    caption: string;
}

interface UpdateMemorialRequest {
    title: string;
    slug: string;
    description?: string;
    youtubeVideoId?: string;
    images: ImageData[];
    deletedImageUrls?: string[]; // URLs de imágenes eliminadas para borrar de DB
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body: UpdateMemorialRequest = await request.json();
        const { title, slug, description, youtubeVideoId, images, deletedImageUrls } = body;

        // Validación básica
        if (!title || !slug) {
            return NextResponse.json(
                { error: "Título y slug son requeridos" },
                { status: 400 }
            );
        }

        // Verificar que el memorial existe
        const existingMemorial = await prisma.memorial.findUnique({
            where: { id },
            include: { gallery: true },
        });

        if (!existingMemorial) {
            return NextResponse.json(
                { error: "Recuerdo no encontrado" },
                { status: 404 }
            );
        }

        // Verificar que el slug no esté siendo usado por otro memorial
        const slugConflict = await prisma.memorial.findFirst({
            where: {
                slug,
                NOT: { id },
            },
        });

        if (slugConflict) {
            return NextResponse.json(
                { error: "Ya existe otro recuerdo con ese slug" },
                { status: 409 }
            );
        }

        // Identificar imágenes existentes (tienen URL de S3) vs nuevas
        const existingUrls = existingMemorial.gallery.map((img) => img.url);

        // Imágenes que mantener (ya existen en DB y no fueron eliminadas)
        const imagesToKeep = images.filter((img) => existingUrls.includes(img.url));

        // Nuevas imágenes (URLs que no están en las existentes)
        const newImages = images.filter((img) => !existingUrls.includes(img.url));

        // Actualizar en transacción
        const memorial = await prisma.$transaction(async (tx) => {
            // 1. Eliminar imágenes que ya no están
            if (deletedImageUrls && deletedImageUrls.length > 0) {
                await tx.memorialImage.deleteMany({
                    where: {
                        memorialId: id,
                        url: { in: deletedImageUrls },
                    },
                });
            }

            // 2. Actualizar captions de imágenes existentes que se mantienen
            for (const img of imagesToKeep) {
                await tx.memorialImage.updateMany({
                    where: {
                        memorialId: id,
                        url: img.url,
                    },
                    data: {
                        caption: img.caption || null,
                    },
                });
            }

            // 3. Crear nuevas imágenes
            if (newImages.length > 0) {
                await tx.memorialImage.createMany({
                    data: newImages.map((img) => ({
                        id: uuidv4(),
                        memorialId: id,
                        url: img.url,
                        caption: img.caption || null,
                    })),
                });
            }

            // 4. Actualizar datos del memorial
            return tx.memorial.update({
                where: { id },
                data: {
                    title,
                    slug,
                    description: description || null,
                    youtubeVideoId: youtubeVideoId || null,
                },
                include: {
                    gallery: true,
                },
            });
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
        console.error("Error actualizando memorial:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verificar que el memorial existe y obtener sus imágenes
        const memorial = await prisma.memorial.findUnique({
            where: { id },
            include: { gallery: true },
        });

        if (!memorial) {
            return NextResponse.json(
                { error: "Recuerdo no encontrado" },
                { status: 404 }
            );
        }

        // Obtener URLs de las imágenes para que el frontend las elimine de S3
        const imageUrls = memorial.gallery.map((img) => img.url);

        // Eliminar el memorial (las imágenes se eliminan por cascade)
        await prisma.memorial.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            deletedImageUrls: imageUrls, // El frontend usará esto para eliminar de S3
        });
    } catch (error) {
        console.error("Error eliminando memorial:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
