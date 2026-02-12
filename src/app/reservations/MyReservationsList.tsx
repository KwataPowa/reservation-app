'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, PackageCheck, AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { reservationStatusConfig, formatDate, type ReservationStatus } from '@/lib/constants';
import ReturnMaterialModal from '@/components/ReturnMaterialModal';
import CancelReservationDialog from '@/components/reservations/CancelReservationDialog';
import EmptyState from '@/components/shared/EmptyState';

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

export default function MyReservationsList({ reservations: initialReservations }: { reservations: SerializedReservation[] }) {
    const [reservations, setReservations] = useState(initialReservations);
    const [returnModal, setReturnModal] = useState<{ id: string; materialName: string } | null>(null);
    const [filter, setFilter] = useState<'ACTIVE' | 'PAST'>('ACTIVE');

    const updateStatus = (id: string, newStatus: string) => {
        setReservations(prev => prev.map(r =>
            r.id === id ? { ...r, status: newStatus } : r
        ));
    };

    const canReturn = (reservation: SerializedReservation) => {
        if (reservation.status !== 'APPROVED') return false;
        return new Date() >= new Date(reservation.startDate);
    };

    const canCancel = (reservation: SerializedReservation) => {
        return ['PENDING', 'APPROVED'].includes(reservation.status);
    };

    const filtered = reservations.filter((r) => {
        if (filter === 'ACTIVE') return ['PENDING', 'APPROVED'].includes(r.status);
        if (filter === 'PAST') return ['REJECTED', 'CANCELLED', 'RETURNED'].includes(r.status);
        return true;
    });

    const filters = [
        { key: 'ACTIVE' as const, label: 'En cours', count: reservations.filter(r => ['PENDING', 'APPROVED'].includes(r.status)).length },
        { key: 'PAST' as const, label: 'Terminées', count: reservations.filter(r => ['REJECTED', 'CANCELLED', 'RETURNED'].includes(r.status)).length },
    ];

    if (reservations.length === 0) {
        return (
            <EmptyState
                icon={<Package className="h-5 w-5" />}
                title="Aucune réservation"
                description="Vous n'avez pas encore de réservation."
            >
                <Button asChild variant="outline" size="sm">
                    <Link href="/">Parcourir le matériel</Link>
                </Button>
            </EmptyState>
        );
    }

    return (
        <>
            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={cn(
                            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                            filter === f.key
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent'
                        )}
                    >
                        {f.label}
                        <span className={cn(
                            'ml-1.5 text-xs',
                            filter === f.key ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Reservation rows */}
            <div className="space-y-1.5">
                {filtered.map((reservation) => {
                    const config = reservationStatusConfig[reservation.status as ReservationStatus];
                    const StatusIcon = config?.icon;

                    return (
                        <div key={reservation.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                            {/* Status badge */}
                            {config && (
                                <Badge variant="outline" className={cn('text-[11px] gap-1 shrink-0 whitespace-nowrap', config.className)}>
                                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                    {config.label}
                                </Badge>
                            )}

                            {/* Material name */}
                            <span className="text-sm font-semibold text-foreground truncate shrink-0">
                                {reservation.materialName}
                            </span>

                            {/* Dates */}
                            <span className="text-xs text-muted-foreground lab-mono shrink-0 hidden sm:inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3 w-3" />
                                {formatDate(reservation.startDate)} — {formatDate(reservation.endDate)}
                            </span>

                            {/* Return info */}
                            {reservation.status === 'RETURNED' && reservation.returnHasIssue && (
                                <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium shrink-0">
                                    <AlertTriangle className="h-3 w-3" />
                                    Problème
                                </span>
                            )}

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                {canCancel(reservation) && (
                                    <CancelReservationDialog
                                        reservationId={reservation.id}
                                        materialName={reservation.materialName}
                                        status={reservation.status}
                                        onSuccess={() => updateStatus(reservation.id, 'CANCELLED')}
                                    />
                                )}
                                {canReturn(reservation) && (
                                    <Button
                                        size="sm"
                                        className="h-7 gap-1 text-xs px-2"
                                        onClick={() => setReturnModal({ id: reservation.id, materialName: reservation.materialName })}
                                    >
                                        <PackageCheck className="h-3.5 w-3.5" />
                                        Rendre
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <EmptyState
                        title="Aucune réservation dans cette catégorie"
                        description="Changez de filtre pour voir d'autres réservations."
                    />
                )}
            </div>

            {/* Return Modal */}
            {returnModal && (
                <ReturnMaterialModal
                    isOpen={true}
                    onClose={() => setReturnModal(null)}
                    reservationId={returnModal.id}
                    materialName={returnModal.materialName}
                    onSuccess={() => updateStatus(returnModal.id, 'RETURNED')}
                />
            )}
        </>
    );
}
