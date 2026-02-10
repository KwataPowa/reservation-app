import prisma from "@/lib/prisma";
import MaterialList from "@/components/MaterialList";
import { auth } from "@/auth";

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
      {/* Dashboard Header */}
      <div className="flex items-center justify-between bg-white p-6 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#2566AF]"></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
            Parc Matériel ICUBE
          </h1>
          <p className="mt-1 text-xs text-gray-500 font-mono">
            SYSTÈME DE RÉSERVATION UNIFIÉ V2.0
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#2566AF] font-mono leading-none">{materials.length}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unités Totales</div>
        </div>
      </div>

      <MaterialList materials={materials} categories={grouped} />
    </div>
  );
}
