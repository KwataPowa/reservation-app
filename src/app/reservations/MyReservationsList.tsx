'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, CheckCircle, XCircle, Ban, PackageCheck, AlertTriangle } from 'lucide-react';
import ReturnMaterialModal from '@/components/ReturnMaterialModal';

interface SerializedReservation {
    id: string;
    startDate: string;
    endDate: string;
    purpose: string | null;
    status: string;
    returnedAt: string | null;
    returnNote: string | null;
    returnHasIssue: boolean;
    materialName: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
    APPROVED: { label: 'Approuvée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    REJECTED: { label: 'Refusée', color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={12} /> },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: <Ban size={12} /> },
    RETURNED: { label: 'Rendu', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <PackageCheck size={12} /> },
};

export default function MyReservationsList({ reservations }: { reservations: SerializedReservation[] }) {
    const [returnModal, setReturnModal] = useState<{ id: string; materialName: string } | null>(null);

    const canReturn = (reservation: SerializedReservation) => {
        if (reservation.status !== 'APPROVED') return false;
        const now = new Date();
        const startDate = new Date(reservation.startDate);
        return now >= startDate;
    };

    return (
        <>
            {reservations.length === 0 ? (
                <div className="bg-white border border-gray-200 text-center py-12">
                    <p className="text-gray-400 text-sm mb-3">Aucune réservation enregistrée.</p>
                    <Link href="/" className="text-sm font-medium text-[#2566AF] hover:text-[#1A4B82]">
                        Parcourir le matériel
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                    {reservations.map((reservation) => {
                        const config = statusConfig[reservation.status] || statusConfig.PENDING;
                        return (
                            <div key={reservation.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {reservation.materialName}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays size={12} className="text-gray-400" />
                                            {new Date(reservation.startDate).toLocaleDateString('fr-FR')} — {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                                        </span>
                                        {reservation.purpose && (
                                            <span className="text-gray-400 truncate max-w-[250px]">{reservation.purpose}</span>
                                        )}
                                    </div>
                                    {/* Return info */}
                                    {reservation.status === 'RETURNED' && (
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                            {reservation.returnedAt && (
                                                <span className="text-blue-600">
                                                    Rendu le {new Date(reservation.returnedAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                            {reservation.returnHasIssue && (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                    <AlertTriangle size={11} />
                                                    Problème signalé
                                                </span>
                                            )}
                                            {reservation.returnNote && (
                                                <span className="text-gray-500 italic truncate max-w-[300px]" title={reservation.returnNote}>
                                                    — {reservation.returnNote}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
                                        {config.icon}
                                        {config.label}
                                    </span>
                                    {canReturn(reservation) && (
                                        <button
                                            onClick={() => setReturnModal({ id: reservation.id, materialName: reservation.materialName })}
                                            className="inline-flex items-center gap-1.5 bg-[#2566AF] text-white px-3 py-1.5 text-xs font-semibold rounded hover:bg-[#1A4B82] transition-colors shadow-sm"
                                        >
                                            <PackageCheck size={13} />
                                            Rendre
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Return Modal */}
            {returnModal && (
                <ReturnMaterialModal
                    isOpen={true}
                    onClose={() => setReturnModal(null)}
                    reservationId={returnModal.id}
                    materialName={returnModal.materialName}
                />
            )}
        </>
    );
}
