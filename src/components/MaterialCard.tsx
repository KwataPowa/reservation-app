'use client';

import { Material } from "@prisma/client";
import { MapPin, Tag, Hash } from 'lucide-react';

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

    return (
        <button
            onClick={() => onClick(material)}
            className="lab-panel h-full flex flex-col text-left w-full group hover:shadow-lg hover:border-[#2566AF]/30 transition-all duration-200 cursor-pointer"
        >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                <span className="lab-mono text-gray-400 text-[11px] flex items-center gap-1.5">
                    <Hash size={11} strokeWidth={2.5} />
                    {material.id.slice(0, 8).toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{config.label}</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-grow">
                <h3 className="font-semibold text-gray-900 leading-tight mb-1.5 group-hover:text-[#2566AF] transition-colors text-[15px]">
                    {material.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {material.description || 'Aucune description disponible'}
                </p>
            </div>

            {/* Footer metadata */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    {material.location}
                </span>
                <span className="flex items-center gap-1.5">
                    <Tag size={12} className="text-gray-400" />
                    {material.category}
                </span>
            </div>
        </button>
    );
}
