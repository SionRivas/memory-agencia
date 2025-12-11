import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { SignOut } from "@/components/SignOut";
import UploadForm from "@/components/UploadForm";
import UserAvatar from "@/components/UserAvatar";

import { prisma } from "@/lib/prisma";
import { SessionProvider } from "next-auth/react";

export default async function AdminPage() {
  const RecuerdosServer = await prisma.memorial.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      gallery: true,
    },
  });

  const RecuerdosWithPhotos = RecuerdosServer.map((memorial) => ({
    ...memorial,
    fotos: memorial.gallery.map((img) => ({
      url: img.url,
      caption: img.caption || "", // Provide a default value if caption is null
    })),
  }));

  return (
    <>
      <SessionProvider>
        <AdminDashboard recuerdosServer={RecuerdosWithPhotos} />
      </SessionProvider>
    </>
  );
}
