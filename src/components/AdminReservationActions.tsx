'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, CheckCircle, XCircle, Ban, AlertCircle, MapPin, PackageCheck, AlertTriangle } from 'lucide-react';
import ReturnMaterialModal from '@/components/ReturnMaterialModal';

interface Reservation {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    purpose: string | null;
    createdAt: string;
    location: string | null;
    returnedAt: string | null;
    returnNote: string | null;
    returnHasIssue: boolean;
    user: { name: string | null; email: string };
    material: { name: string; category: string | null };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
    APPROVED: { label: 'Approuvée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    REJECTED: { label: 'Refusée', color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={12} /> },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: <Ban size={12} /> },
    RETURNED: { label: 'Rendu', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <PackageCheck size={12} /> },
};

export default function AdminReservationActions({ reservation }: { reservation: Reservation }) {
    const router = useRouter();
    const [status, setStatus] = useState(reservation.status);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showReturnModal, setShowReturnModal] = useState(false);

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
                router.refresh();
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
        <>
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
                <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                        <span className="lab-mono">
                            {new Date(reservation.startDate).toLocaleDateString('fr-FR')} → {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium rounded w-fit ${config.color}`}>
                            {config.icon}
                            {config.label}
                        </span>
                        {/* Return info */}
                        {status === 'RETURNED' && reservation.returnedAt && (
                            <span className="text-[10px] text-blue-600">
                                Rendu le {new Date(reservation.returnedAt).toLocaleDateString('fr-FR')}
                            </span>
                        )}
                        {status === 'RETURNED' && reservation.returnHasIssue && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-medium">
                                <AlertTriangle size={10} />
                                Problème : {reservation.returnNote || 'Non précisé'}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={reservation.purpose || ''}>
                    {reservation.purpose || '—'}
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
                    ) : status === 'APPROVED' ? (
                        <button
                            onClick={() => setShowReturnModal(true)}
                            className="inline-flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors rounded shadow-sm"
                        >
                            <PackageCheck size={13} />
                            Forcer le retour
                        </button>
                    ) : null}
                </td>
            </tr>

            {/* Return Modal */}
            {showReturnModal && (
                <ReturnMaterialModal
                    isOpen={true}
                    onClose={() => setShowReturnModal(false)}
                    reservationId={reservation.id}
                    materialName={reservation.material.name}
                    isAdminForce={true}
                />
            )}
        </>
    );
}
