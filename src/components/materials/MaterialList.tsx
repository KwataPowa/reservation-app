'use client';

import { useState, useMemo } from 'react';
import { Material } from '@prisma/client';
import { AnimatePresence } from 'framer-motion';
import MaterialCard from './MaterialCard';
import MaterialDetailDialog from './MaterialDetailDialog';
import MaterialSearch from './MaterialSearch';
import EmptyState from '@/components/shared/EmptyState';
import { Package } from 'lucide-react';

interface MaterialListProps {
  materials: Material[];
  categories: Record<string, Material[]>;
  isAdmin?: boolean;
}

export default function MaterialList({ materials, categories, isAdmin }: MaterialListProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const categoryNames = useMemo(() => Object.keys(categories).sort(), [categories]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      return true;
    });
  }, [materials, search, categoryFilter, statusFilter]);

  // Group filtered materials by category
  const filteredByCategory = useMemo(() => {
    return filteredMaterials.reduce((acc, mat) => {
      const cat = mat.category || 'Non classe';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(mat);
      return acc;
    }, {} as Record<string, Material[]>);
  }, [filteredMaterials]);

  const handleCardClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <MaterialSearch
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categoryNames}
      />

      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="Aucun materiel trouve"
          description="Essayez de modifier vos filtres ou votre recherche."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-foreground">{category}</h2>
                  <div className="h-px bg-border flex-grow" />
                  <span className="text-xs text-muted-foreground lab-mono">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        onClick={handleCardClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
        </div>
      )}

      <MaterialDetailDialog
        material={selectedMaterial}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
