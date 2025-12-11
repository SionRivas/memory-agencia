"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  QrCode,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QRModal } from "./qr-modal";

export interface Recuerdo {
  title: string;
  id: string;
  slug: string;
  description: string | null;
  youtubeVideoId: string | null;
  fotos: { url: string; caption: string }[];
  createdAt: Date;
  updatedAt: Date;
}

interface AdminDashboardProps {
  recuerdosServer: Recuerdo[];
}

export function AdminDashboard({ recuerdosServer }: AdminDashboardProps) {
  const [recuerdos, setRecuerdos] = useState<Recuerdo[]>(recuerdosServer);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecuerdo, setEditingRecuerdo] = useState<Recuerdo | null>(null);
  const [qrRecuerdo, setQrRecuerdo] = useState<Recuerdo | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const filteredRecuerdos = recuerdos.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const { data: session } = useSession();
  const handleCreateNew = () => {
    setEditingRecuerdo(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (recuerdo: Recuerdo) => {
    setEditingRecuerdo(recuerdo);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    setRecuerdos(recuerdos.filter((r) => r.id !== id));
  };

  const handleSave = (recuerdo: Recuerdo) => {
    if (editingRecuerdo) {
      setRecuerdos(recuerdos.map((r) => (r.id === recuerdo.id ? recuerdo : r)));
    } else {
      setRecuerdos([
        ...recuerdos,
        { ...recuerdo, id: Date.now().toString(), createdAt: new Date() },
      ]);
    }
    setIsEditorOpen(false);
    setEditingRecuerdo(null);
  };

  const copySlug = async (slug: string) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/recuerdo/${slug}`
    );
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // if (isEditorOpen) {
  //   return (
  //     <RecuerdoEditor
  //       recuerdo={editingRecuerdo}
  //       onSave={handleSave}
  //       onCancel={() => {
  //         setIsEditorOpen(false)
  //         setEditingRecuerdo(null)
  //       }}
  //     />
  //   )
  // }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              Panel de Administración
            </h1>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Nuevo Recuerdo
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage
                      src={session?.user?.image || "/default-avatar.png"}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => signOut()}>
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Data Table */}
        {filteredRecuerdos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              No hay recuerdos aún
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Crea tu primer recuerdo para comenzar
            </p>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Nuevo Recuerdo
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug (URL)</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecuerdos.map((recuerdo) => (
                  <TableRow key={recuerdo.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={recuerdo.fotos[0]?.url || "/placeholder.svg"}
                        />
                        <AvatarFallback>{recuerdo.title[0]}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {recuerdo.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-sm text-muted-foreground">
                          /recuerdo/{recuerdo.slug}
                        </code>
                        <button
                          onClick={() => copySlug(recuerdo.slug)}
                          className="rounded p-1 hover:bg-muted"
                          aria-label="Copiar URL"
                        >
                          {copiedSlug === recuerdo.slug ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Creado el {recuerdo.createdAt.toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(recuerdo)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`/recuerdo/${recuerdo.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver en vivo
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setQrRecuerdo(recuerdo)}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Generar/Descargar QR
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(recuerdo.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* QR Modal  */}
      {qrRecuerdo && (
        <QRModal recuerdo={qrRecuerdo} onClose={() => setQrRecuerdo(null)} />
      )}
    </div>
  );
}
