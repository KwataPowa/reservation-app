'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, MapPin, PackageCheck, AlertTriangle } from 'lucide-react';
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
    material: { name: string; category: string | null };
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
            <Card className="overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-foreground">
                                    {reservation.material.name}
                                </p>
                                {reservation.material.category && (
                                    <span className="text-[11px] text-muted-foreground">
                                        {reservation.material.category}
                                    </span>
                                )}
                                {config && (
                                    <Badge variant="outline" className={cn('text-[11px] gap-1', config.className)}>
                                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                        {config.label}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {reservation.user.name || 'Sans nom'}
                                </span>
                                <a href={`mailto:${reservation.user.email}`} className="text-primary hover:underline">
                                    {reservation.user.email}
                                </a>
                                {reservation.location && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {reservation.location}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="lab-mono">
                                    {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                                </span>
                                {reservation.purpose && (
                                    <span className="truncate max-w-[300px]">{reservation.purpose}</span>
                                )}
                            </div>

                            {/* Return info */}
                            {status === 'RETURNED' && (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {reservation.returnedAt && (
                                        <span className="text-blue-600">
                                            Rendu le {formatDate(reservation.returnedAt)}
                                        </span>
                                    )}
                                    {reservation.returnHasIssue && (
                                        <span className="inline-flex items-center gap-1 text-destructive font-medium">
                                            <AlertTriangle className="h-3 w-3" />
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
                                />
                            )}
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
                />
            )}
        </>
    );
}
