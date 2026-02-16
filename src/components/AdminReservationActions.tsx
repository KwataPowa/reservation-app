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
            <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
                <CardContent className="p-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Material name, status, user name and email */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-foreground">
                                    {reservation.material.name}
                                </span>
                                {config && (
                                    <Badge variant="outline" className={cn('text-[11px] gap-1 shrink-0', config.className)}>
                                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                        {config.label}
                                    </Badge>
                                )}
                                {reservation.returnHasIssue && (
                                    <Badge variant="destructive" className="text-[11px] gap-1 shrink-0">
                                        <AlertTriangle className="h-3 w-3" />
                                        Problème
                                    </Badge>
                                )}
                                <span className="text-muted-foreground text-xs">•</span>
                                <span className="font-medium text-foreground text-xs">
                                    {reservation.user.name || 'Sans nom'}
                                </span>
                                <a
                                    href={`mailto:${reservation.user.email}`}
                                    className="text-primary hover:underline text-xs"
                                >
                                    {reservation.user.email}
                                </a>
                            </div>

                            {/* Reservation period, location, and dates */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDate(reservation.startDate)} — {formatDate(reservation.endDate)}
                                </span>
                                {reservation.location && (
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {reservation.location}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Demandé le {formatDate(reservation.createdAt)}
                                </span>
                            </div>

                            {/* Return date if returned */}
                            {status === 'RETURNED' && reservation.returnedAt && (
                                <div className="text-xs text-blue-600">
                                    Rendu le {formatDate(reservation.returnedAt)}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {status === 'PENDING' && (
                                <>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleAction('APPROVED')}
                                        disabled={loading}
                                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                        title="Valider"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleAction('REJECTED')}
                                        disabled={loading}
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        title="Refuser"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {status === 'APPROVED' && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowReturnModal(true)}
                                    className="h-7 gap-1 text-xs px-2"
                                >
                                    <PackageCheck className="h-3.5 w-3.5" />
                                    Retour
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
