'use client';

import { Material } from "@prisma/client";
import { MapPin, Tag, Hash, DollarSign, Box } from 'lucide-react';

interface MaterialCardProps {
    material: Material;
    onClick: (material: Material) => void;
}

const statusConfig: Record<string, { label: string; dotColor: string }> = {
    AVAILABLE: { label: 'Disponible', dotColor: 'bg-emerald-500' },
    MAINTENANCE: { label: 'Maintenance', dotColor: 'bg-amber-500' },
    UNAVAILABLE: { label: 'Indisponible', dotColor: 'bg-red-500' },
};

export default function MaterialCard({ material, onClick }: MaterialCardProps) {
    const config = statusConfig[material.status] || statusConfig.AVAILABLE;
    // @ts-ignore
    const componentCount = Array.isArray(material.components) ? material.components.length : 0;

    return (
        <button
            onClick={() => onClick(material)}
            className="group relative bg-white border border-gray-200 hover:border-[#2566AF] hover:shadow-md transition-all duration-200 text-left w-full overflow-hidden flex flex-col h-full"
        >
            {/* Status Line */}
            <div className={`absolute top-0 left-0 w-1 h-full ${config.dotColor} opacity-50 group-hover:opacity-100 transition-opacity`} />

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                    <span className="lab-mono text-gray-400 text-[10px] flex items-center gap-1">
                        <Hash size={10} />
                        {material.id.slice(0, 8).toUpperCase()}
                    </span>
                    <h3 className="font-bold text-gray-900 leading-snug mt-1 group-hover:text-[#2566AF] transition-colors text-[15px]">
                        {material.name}
                    </h3>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.dotColor.replace('bg-', 'bg-opacity-10 text-')}`}>
                    {config.label}
                </span>
            </div>

            {/* Compact Specs Grid */}
            <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                <div className="bg-white p-2.5 flex flex-col">
                    <span className="text-[10px] uppercase text-gray-400 font-bold mb-0.5 flex items-center gap-1">
                        <MapPin size={10} /> Localisation
                    </span>
                    <span className="text-xs font-medium text-gray-700">{material.location || '-'}</span>
                </div>
                <div className="bg-white p-2.5 flex flex-col">
                    <span className="text-[10px] uppercase text-gray-400 font-bold mb-0.5 flex items-center gap-1">
                        <Tag size={10} /> Catégorie
                    </span>
                    <span className="text-xs font-medium text-gray-700 truncate">{material.category || '-'}</span>
                </div>
            </div>

            {/* Description / Content Preview */}
            <div className="p-4 flex-grow bg-white">
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-3">
                    {material.description || 'Aucune description disponible.'}
                </p>

                {/* Meta Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                    {material.budget && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100 rounded">
                            <DollarSign size={10} /> {material.budget}
                        </span>
                    )}
                    {componentCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200 rounded">
                            <Box size={10} /> {componentCount} élément{componentCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Action Bar (Hover only) */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
                <span className="text-xs font-semibold text-gray-400 group-hover:text-[#2566AF] uppercase tracking-wide transition-colors">
                    Voir détails & réserver →
                </span>
            </div>
        </button>
    );
}
