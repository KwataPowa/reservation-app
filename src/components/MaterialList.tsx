'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import MaterialCard from './MaterialCard';
import ReservationModal from './ReservationModal';

interface MaterialListProps {
    materials: Material[];
    categories: Record<string, Material[]>;
}

export default function MaterialList({ materials, categories }: MaterialListProps) {
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const handleReserve = (material: Material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const activeCategories = filter === 'ALL'
        ? Object.entries(categories)
        : Object.entries(categories).filter(([cat]) => cat === filter);

    return (
        <div className="flex flex-col gap-6">
            {/* Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 lab-scrollbar">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all ${filter === 'ALL'
                            ? 'bg-[#2566AF] text-white border-[#2566AF]'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                >
                    Tout voir
                </button>
                {Object.keys(categories).sort().map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap ${filter === cat
                                ? 'bg-[#2566AF] text-white border-[#2566AF]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="space-y-8">
                {activeCategories.map(([category, items]) => (
                    <div key={category} className="animate-in fade-in duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{category}</h2>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                            <span className="text-xs text-gray-400 font-mono">{items.length} ITEM{items.length > 1 ? 'S' : ''}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map((material) => (
                                <MaterialCard
                                    key={material.id}
                                    material={material}
                                    onReserve={handleReserve}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {activeCategories.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded">
                        <p className="text-gray-400 text-sm">Aucun matériel trouvé dans cette catégorie.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <ReservationModal
                material={selectedMaterial}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
