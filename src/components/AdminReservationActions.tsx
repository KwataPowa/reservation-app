'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, CheckCircle, XCircle, Ban, AlertCircle, MapPin } from 'lucide-react';

interface Reservation {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    purpose: string | null;
    createdAt: string;
    location: string | null;
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
    const router = useRouter();
    const [status, setStatus] = useState(reservation.status);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAction = async (newStatus: 'APPROVED' | 'REJECTED') => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh(); // Refresh server components (counters, etc.)
            } else {
                const data = await res.json();
                setError(data.error || 'Erreur inconnue');
            }
        } catch (err) {
            setError('Erreur réseau');
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
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{reservation.user.name || 'Sans nom'}</span>
                    <a href={`mailto:${reservation.user.email}`} className="text-xs text-blue-600 hover:underline">{reservation.user.email}</a>
                    {reservation.location && (
                        <span className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} /> {reservation.location}
                        </span>
                    )}
                </div>
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500 lab-mono">
                {new Date(reservation.startDate).toLocaleDateString('fr-FR')} → {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
            </td>
            <td className="px-3 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={reservation.purpose || ''}>
                {reservation.purpose || '—'}
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm">
                <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium rounded ${config.color}`}>
                    {config.icon}
                    {config.label}
                </span>
            </td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-right pr-6">
                {error ? (
                    <span className="text-xs text-red-600 flex items-center justify-end gap-1">
                        <AlertCircle size={12} /> {error}
                    </span>
                ) : status === 'PENDING' ? (
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => handleAction('APPROVED')}
                            disabled={loading}
                            className="inline-flex items-center gap-1 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors rounded shadow-sm"
                        >
                            <Check size={13} />
                            Valider
                        </button>
                        <button
                            onClick={() => handleAction('REJECTED')}
                            disabled={loading}
                            className="inline-flex items-center gap-1 bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors rounded shadow-sm"
                        >
                            <X size={13} />
                            Refuser
                        </button>
                    </div>
                ) : null}
            </td>
        </tr>
    );
}
