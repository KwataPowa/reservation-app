'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, PackageCheck, AlertTriangle, Package, Box, MapPin, Tag } from 'lucide-react';
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
    material: {
        name: string;
        imageUrl: string | null;
        category: string | null;
        location: string | null;
    };
}

export default function MyReservationsList({ reservations: initialReservations }: { reservations: SerializedReservation[] }) {
    const [reservations, setReservations] = useState(initialReservations);
    const [returnModal, setReturnModal] = useState<{ id: string; material: { name: string } } | null>(null);
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

            {/* Reservation cards */}
            <div className="space-y-4">
                {filtered.map((reservation) => {
                    const config = reservationStatusConfig[reservation.status as ReservationStatus];
                    const StatusIcon = config?.icon;

                    return (
                        <Card key={reservation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row gap-0">
                                    {/* Material image */}
                                    <div className="sm:w-48 h-40 sm:h-auto bg-muted flex items-center justify-center shrink-0">
                                        {reservation.material.imageUrl ? (
                                            <img
                                                src={reservation.material.imageUrl}
                                                alt={reservation.material.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Box className="h-12 w-12 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0 space-y-3">
                                            {/* Title and status */}
                                            <div className="flex items-start gap-2 flex-wrap">
                                                <h3 className="text-base font-semibold text-foreground">
                                                    {reservation.material.name}
                                                </h3>
                                                {config && (
                                                    <Badge variant="outline" className={cn('text-xs gap-1.5 shrink-0', config.className)}>
                                                        {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
                                                        {config.label}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Material info */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                                {reservation.material.category && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Tag className="h-3.5 w-3.5" />
                                                        <span>{reservation.material.category}</span>
                                                    </span>
                                                )}
                                                {reservation.material.location && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span>{reservation.material.location}</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Dates and purpose */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                                                <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {formatDate(reservation.startDate)} — {formatDate(reservation.endDate)}
                                                </span>
                                                {reservation.purpose && (
                                                    <span className="text-muted-foreground italic line-clamp-1">
                                                        {reservation.purpose}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Return info */}
                                            {reservation.status === 'RETURNED' && (
                                                <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t">
                                                    {reservation.returnedAt && (
                                                        <span className="text-blue-600 font-medium">
                                                            Rendu le {formatDate(reservation.returnedAt)}
                                                        </span>
                                                    )}
                                                    {reservation.returnHasIssue && (
                                                        <span className="inline-flex items-center gap-1.5 text-destructive font-medium">
                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                            Problème signalé
                                                        </span>
                                                    )}
                                                    {reservation.returnNote && (
                                                        <span className="text-muted-foreground italic line-clamp-1 flex-1">
                                                            {reservation.returnNote}
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
                                                    materialName={reservation.material.name}
                                                    status={reservation.status}
                                                    onSuccess={() => updateStatus(reservation.id, 'CANCELLED')}
                                                />
                                            )}
                                            {canReturn(reservation) && (
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5"
                                                    onClick={() => setReturnModal({ id: reservation.id, material: { name: reservation.material.name } })}
                                                >
                                                    <PackageCheck className="h-3.5 w-3.5" />
                                                    Rendre
                                                </Button>
                                            )}
                                        </div>
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
                    materialName={returnModal.material.name}
                    onSuccess={() => updateStatus(returnModal.id, 'RETURNED')}
                />
            )}
        </>
    );
}
