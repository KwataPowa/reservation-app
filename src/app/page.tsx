import prisma from "@/lib/prisma";
import MaterialCard from "@/components/MaterialCard";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  const materials = await prisma.material.findMany({
    orderBy: { category: 'asc' }
  });

  // Group materials by category
  const grouped = materials.reduce((acc, mat) => {
    const cat = mat.category || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mat);
    return acc;
  }, {} as Record<string, typeof materials>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Matériel ICUBE
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {materials.length} équipement{materials.length > 1 ? 's' : ''} disponible{materials.length > 1 ? 's' : ''} à la réservation
          </p>
        </div>
        {session?.user?.role === 'ADMIN' && (
          <a
            href="/admin/materials/new"
            className="inline-flex items-center rounded-md bg-[#2566AF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5294] transition-colors"
          >
            + Ajouter un matériel
          </a>
        )}
      </div>

      {/* Materials by category */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        </div>
      ))}

      {materials.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          Aucun matériel trouvé.
        </p>
      )}
    </div>
  );
}
