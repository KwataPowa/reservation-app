'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, PackageCheck, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAST'>('ALL');

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
        { key: 'ALL' as const, label: 'Toutes', count: reservations.length },
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

            {/* Reservation cards */}
            <div className="space-y-3">
                {filtered.map((reservation) => {
                    const config = reservationStatusConfig[reservation.status as ReservationStatus];
                    const StatusIcon = config?.icon;

                    return (
                        <Card key={reservation.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-foreground">
                                                {reservation.materialName}
                                            </p>
                                            {config && (
                                                <Badge variant="outline" className={cn('text-[11px] gap-1', config.className)}>
                                                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                                    {config.label}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CalendarDays className="h-3 w-3" />
                                                {formatDate(reservation.startDate)} — {formatDate(reservation.endDate)}
                                            </span>
                                            {reservation.purpose && (
                                                <span className="truncate max-w-[250px]">{reservation.purpose}</span>
                                            )}
                                        </div>

                                        {/* Return info */}
                                        {reservation.status === 'RETURNED' && (
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                {reservation.returnedAt && (
                                                    <span className="text-blue-600">
                                                        Rendu le {formatDate(reservation.returnedAt)}
                                                    </span>
                                                )}
                                                {reservation.returnHasIssue && (
                                                    <span className="inline-flex items-center gap-1 text-destructive font-medium">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Problème signalé
                                                    </span>
                                                )}
                                                {reservation.returnNote && (
                                                    <span className="text-muted-foreground italic truncate max-w-[300px]" title={reservation.returnNote}>
                                                        — {reservation.returnNote}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
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
                                                className="gap-1.5"
                                                onClick={() => setReturnModal({ id: reservation.id, materialName: reservation.materialName })}
                                            >
                                                <PackageCheck className="h-3.5 w-3.5" />
                                                Rendre
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
