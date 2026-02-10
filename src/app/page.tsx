import prisma from "@/lib/prisma";
import MaterialCard from "@/components/MaterialCard";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function Home() {
  const session = await auth();

  // Fetch materials
  const materials = await prisma.material.findMany({
    orderBy: { category: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Matériel ICUBE
        </h1>
        {session?.user?.role === 'ADMIN' && (
          <div className="mt-4 flex sm:ml-4 sm:mt-0">
            <a
              href="/admin/materials/new"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Ajouter un matériel
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {materials.length > 0 ? (
          materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full py-10">
            Aucun matériel trouvé. (La base de données est peut-être vide ou non connectée)
          </p>
        )}
      </div>
    </div>
  );
}
