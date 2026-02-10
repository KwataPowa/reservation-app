'use client';

import { useState } from 'react';
import { Check, X, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';

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

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
    APPROVED: { label: 'Approuvée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    REJECTED: { label: 'Refusée', color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={12} /> },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: <Ban size={12} /> },
};

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

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="whitespace-nowrap py-3 pl-6 pr-3 text-sm font-medium text-gray-900">
                {reservation.material.name}
                {reservation.material.category && (
                    <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{reservation.material.category}</span>
                )}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-600">
                {reservation.user.name || reservation.user.email}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 lab-mono">
                {new Date(reservation.startDate).toLocaleDateString('fr-FR')} → {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
            </td>
            <td className="px-3 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={reservation.purpose || ''}>
                {reservation.purpose || '—'}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm">
                <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium ${config.color}`}>
                    {config.icon}
                    {config.label}
                </span>
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-right pr-6">
                {status === 'PENDING' && (
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => handleAction('APPROVED')}
                            disabled={loading}
                            className="inline-flex items-center gap-1 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            <Check size={13} />
                            Valider
                        </button>
                        <button
                            onClick={() => handleAction('REJECTED')}
                            disabled={loading}
                            className="inline-flex items-center gap-1 bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            <X size={13} />
                            Refuser
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}
