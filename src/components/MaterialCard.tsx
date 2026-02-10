'use client';

import { Material } from '@prisma/client';
import Link from 'next/link';

interface MaterialCardProps {
    material: Material;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'Disponible', color: 'bg-green-100 text-green-700' },
    MAINTENANCE: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-700' },
    UNAVAILABLE: { label: 'Indisponible', color: 'bg-red-100 text-red-700' },
};

export default function MaterialCard({ material }: MaterialCardProps) {
    const status = statusLabels[material.status] || statusLabels.AVAILABLE;

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:border-[#2566AF]/30 hover:shadow-md transition-all">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                        {material.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                    </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {material.description || 'Aucune description'}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span>📍 {material.location}</span>
                    <span>📁 {material.category}</span>
                </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-3">
                <Link
                    href={`/reservations/create/${material.id}`}
                    className="text-sm font-medium text-[#2566AF] hover:text-[#1e5294] transition-colors"
                >
                    Réserver →
                </Link>
            </div>
        </div>
    );
}
