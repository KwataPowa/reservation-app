'use client';

import { useState } from 'react';

interface Reservation {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    purpose: string | null;
    createdAt: string;
    user: { name: string | null; email: string };
    material: { name: string; category: string | null };
}

export default function AdminReservationActions({ reservation }: { reservation: Reservation }) {
    const [status, setStatus] = useState(reservation.status);
    const [loading, setLoading] = useState(false);

    const handleAction = async (newStatus: 'APPROVED' | 'REJECTED') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setStatus(newStatus);
            }
        } finally {
            setLoading(false);
        }
    };

    const statusConfig: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
        APPROVED: { label: 'Approuvée', color: 'bg-green-100 text-green-700' },
        REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
        CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-600' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="whitespace-nowrap py-3 pl-5 pr-3 text-sm font-medium text-gray-900">
                {reservation.material.name}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                {reservation.user.name || reservation.user.email}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                {new Date(reservation.startDate).toLocaleDateString('fr-FR')} → {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
            </td>
            <td className="px-3 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                {reservation.purpose || '-'}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                    {config.label}
                </span>
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-right">
                {status === 'PENDING' && (
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => handleAction('APPROVED')}
                            disabled={loading}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                        >
                            ✓ Approuver
                        </button>
                        <button
                            onClick={() => handleAction('REJECTED')}
                            disabled={loading}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                        >
                            ✗ Refuser
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}
