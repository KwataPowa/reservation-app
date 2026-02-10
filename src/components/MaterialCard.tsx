'use client';

import { Material } from "@prisma/client";

interface MaterialCardProps {
    material: Material;
    onReserve: (material: Material) => void;
}

const statusConfig: Record<string, { label: string; color: string; indicator: string }> = {
    AVAILABLE: { label: 'DISPO', color: 'text-green-700 bg-green-50', indicator: 'bg-green-500' },
    MAINTENANCE: { label: 'MAINT', color: 'text-yellow-700 bg-yellow-50', indicator: 'bg-yellow-500' },
    UNAVAILABLE: { label: 'INDISP', color: 'text-red-700 bg-red-50', indicator: 'bg-red-500' },
};

export default function MaterialCard({ material, onReserve }: MaterialCardProps) {
    const config = statusConfig[material.status] || statusConfig.AVAILABLE;

    return (
        <div className="lab-panel h-full flex flex-col group hover:shadow-lg transition-all duration-200">
            {/* Header / ID Code */}
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="lab-mono text-gray-500 text-xs">ID-{material.id.slice(0, 8).toUpperCase()}</span>
                <div className={`h-2 w-2 rounded-full ${config.indicator}`} title={config.label} />
            </div>

            {/* Content */}
            <div className="p-4 flex-grow">
                <h3 className="font-semibold text-gray-900 leading-tight mb-2 group-hover:text-[#2566AF] transition-colors">
                    {material.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-3 mb-4 font-mono">
                    {material.description || 'N/A'}
                </p>

                <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-gray-600 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-400 font-bold">LOC</span>
                        <span className="lab-mono">{material.location}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-gray-400 font-bold">CAT</span>
                        <span className="lab-mono">{material.category}</span>
                    </div>
                    {material.serialNumber && (
                        <div className="flex flex-col col-span-2 mt-2 pt-2 border-t border-dashed border-gray-200">
                            <span className="text-[10px] uppercase text-gray-400 font-bold">S/N</span>
                            <span className="lab-mono">{material.serialNumber}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Footer */}
            <div className={`px-4 py-2 text-xs font-bold border-t border-gray-100 flex justify-between items-center ${config.color}`}>
                <span>{config.label}</span>
                {material.status === 'AVAILABLE' && (
                    <button
                        onClick={() => onReserve(material)}
                        className="bg-white border border-current rounded px-2 py-0.5 hover:bg-opacity-50 transition-colors uppercase text-[10px]"
                    >
                        Réserver
                    </button>
                )}
            </div>
        </div>
    );
}
