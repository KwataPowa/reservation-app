'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, PackageCheck, AlertTriangle } from 'lucide-react';
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
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                {/* Status badge */}
                {config && (
                    <Badge variant="outline" className={cn('text-[11px] gap-1 shrink-0 whitespace-nowrap', config.className)}>
                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                        {config.label}
                    </Badge>
                )}

                {/* Material + User */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground truncate shrink-0">
                        {reservation.material.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {reservation.user.name || reservation.user.email}
                    </span>
                </div>

                {/* Dates */}
                <span className="text-xs text-muted-foreground lab-mono shrink-0 hidden sm:block">
                    {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                </span>

                {/* Return info */}
                {status === 'RETURNED' && reservation.returnHasIssue && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}

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
