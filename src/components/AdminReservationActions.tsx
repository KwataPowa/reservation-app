'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, MapPin, PackageCheck, AlertTriangle, Box, Tag, CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { reservationStatusConfig, formatDate, type ReservationStatus } from '@/lib/constants';
import ReturnMaterialModal from '@/components/ReturnMaterialModal';
import CancelReservationDialog from '@/components/reservations/CancelReservationDialog';
import { toast } from 'sonner';

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
    material: {
        name: string;
        category: string | null;
        imageUrl: string | null;
        location: string | null;
    };
}

export default function AdminReservationActions({ reservation }: { reservation: Reservation }) {
    const router = useRouter();
    const [status, setStatus] = useState(reservation.status);
    const [loading, setLoading] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);

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
                toast.success(newStatus === 'APPROVED' ? 'Réservation approuvée' : 'Réservation refusée');
                router.refresh();
            } else {
                const data = await res.json();
                toast.error('Erreur', { description: data.error || 'Erreur inconnue' });
            }
        } catch {
            toast.error('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    const config = reservationStatusConfig[status as ReservationStatus];
    const StatusIcon = config?.icon;

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
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

                                {/* User info */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                                    <span className="font-semibold text-foreground">
                                        {reservation.user.name || 'Sans nom'}
                                    </span>
                                    <a
                                        href={`mailto:${reservation.user.email}`}
                                        className="text-primary hover:underline text-xs"
                                    >
                                        {reservation.user.email}
                                    </a>
                                </div>

                                {/* Dates, location, purpose */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                                    <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                                        <CalendarDays className="h-4 w-4" />
                                        {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                                    </span>
                                    {reservation.location && (
                                        <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {reservation.location}
                                        </span>
                                    )}
                                </div>

                                {/* Purpose and creation date */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                    {reservation.purpose && (
                                        <span className="italic line-clamp-1 flex-1">
                                            {reservation.purpose}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
                                        <Clock className="h-3.5 w-3.5" />
                                        Demandé le {formatDate(reservation.createdAt)}
                                    </span>
                                </div>

                                {/* Return info */}
                                {status === 'RETURNED' && (
                                    <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t">
                                        {reservation.returnedAt && (
                                            <span className="text-blue-600 font-medium">
                                                Rendu le {formatDate(reservation.returnedAt)}
                                            </span>
                                        )}
                                        {reservation.returnHasIssue && (
                                            <span className="inline-flex items-center gap-1.5 text-destructive font-medium">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                {reservation.returnNote || 'Problème signalé'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {status === 'PENDING' && (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction('APPROVED')}
                                            disabled={loading}
                                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            Valider
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleAction('REJECTED')}
                                            disabled={loading}
                                            className="gap-1.5"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Refuser
                                        </Button>
                                    </>
                                )}
                                {status === 'APPROVED' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowReturnModal(true)}
                                        className="gap-1.5"
                                    >
                                        <PackageCheck className="h-3.5 w-3.5" />
                                        Forcer retour
                                    </Button>
                                )}
                                {['PENDING', 'APPROVED'].includes(status) && (
                                    <CancelReservationDialog
                                        reservationId={reservation.id}
                                        materialName={reservation.material.name}
                                        status={status}
                                        onSuccess={() => setStatus('CANCELLED')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showReturnModal && (
                <ReturnMaterialModal
                    isOpen={true}
                    onClose={() => setShowReturnModal(false)}
                    reservationId={reservation.id}
                    materialName={reservation.material.name}
                    isAdminForce={true}
                    onSuccess={() => setStatus('RETURNED')}
                />
            )}
        </>
    );
}
