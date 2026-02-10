'use client';

import { Material } from '@prisma/client';
import Link from 'next/link';

interface MaterialCardProps {
    material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {material.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${material.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            material.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {material.status}
                    </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {material.description || 'No description available'}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{material.location}</span>
                    <span>{material.category}</span>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                    <Link
                        href={`/reservations/create/${material.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Réserver
                    </Link>
                </div>
            </div>
        </div>
    );
}
