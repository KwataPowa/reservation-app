import prisma from "@/lib/prisma";
import MaterialList from "@/components/materials/MaterialList";
import PageHeader from "@/components/shared/PageHeader";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  const materials = await prisma.material.findMany({
    orderBy: { category: 'asc' }
  });

  // Group materials by category
  const grouped = materials.reduce((acc, mat) => {
    const cat = mat.category || 'Non classé';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mat);
    return acc;
  }, {} as Record<string, typeof materials>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parc Matériel"
        subtitle="Système de réservation de matériel ICUBE"
      >
        <Badge variant="secondary" className="gap-1.5 text-sm font-mono">
          <Package className="h-3.5 w-3.5" />
          {materials.length} unités
        </Badge>
        {session?.user?.role === 'ADMIN' && (
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/materials/new">
              <Plus className="h-4 w-4" />
              Nouveau matériel
            </Link>
          </Button>
        )}
      </PageHeader>

      <MaterialList materials={materials} categories={grouped} isAdmin={session?.user?.role === 'ADMIN'} />
    </div>
  );
}
