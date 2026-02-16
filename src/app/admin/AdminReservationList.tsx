'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import AdminReservationActions from '@/components/AdminReservationActions';
import EmptyState from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

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

type FilterKey = 'PENDING' | 'ACTIVE' | 'PAST';

export default function AdminReservationList({ reservations }: { reservations: Reservation[] }) {
    const [filter, setFilter] = useState<FilterKey>('PENDING');

    const filtered = reservations.filter((r) => {
        if (filter === 'PENDING') return r.status === 'PENDING';
        if (filter === 'ACTIVE') return r.status === 'APPROVED';
        if (filter === 'PAST') return ['REJECTED', 'CANCELLED', 'RETURNED'].includes(r.status);
        return true;
    });

    const filters: { key: FilterKey; label: string; count: number }[] = [
        { key: 'PENDING', label: 'À traiter', count: reservations.filter(r => r.status === 'PENDING').length },
        { key: 'ACTIVE', label: 'En cours', count: reservations.filter(r => r.status === 'APPROVED').length },
        { key: 'PAST', label: 'Terminées', count: reservations.filter(r => ['REJECTED', 'CANCELLED', 'RETURNED'].includes(r.status)).length },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
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
                <span className="text-xs text-muted-foreground lab-mono">{reservations.length} total</span>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={<FileText className="h-5 w-5" />}
                    title="Aucune réservation dans cette catégorie"
                    description="Changez de filtre pour voir d'autres réservations."
                />
            ) : (
                <div className="space-y-2">
                    {filtered.map((reservation) => (
                        <AdminReservationActions
                            key={reservation.id}
                            reservation={reservation}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
