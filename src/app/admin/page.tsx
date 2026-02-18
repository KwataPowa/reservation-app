import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminReservationList from './AdminReservationList';
import PageHeader from '@/components/shared/PageHeader';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await auth();
    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const reservations = await prisma.reservation.findMany({
        include: { user: true, material: true },
        orderBy: { createdAt: 'desc' },
    });

    const materialCount = await prisma.material.count();
    const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
    const approvedCount = reservations.filter(r => r.status === 'APPROVED').length;

    return (
        <div className="space-y-8 pb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
                <p className="text-muted-foreground mt-1">Gestion des ressources et des demandes</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total équipements</p>
                                <p className="text-xl font-bold lab-mono">{materialCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-amber-100 flex items-center justify-center shrink-0">
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">En attente</p>
                                <p className="text-xl font-bold lab-mono text-amber-600">{pendingCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Actives</p>
                                <p className="text-xl font-bold lab-mono text-emerald-600">{approvedCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reservations list */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Réservations</h2>
                <AdminReservationList reservations={reservations.map((reservation) => ({
                    ...reservation,
                    startDate: reservation.startDate.toISOString(),
                    endDate: reservation.endDate.toISOString(),
                    createdAt: reservation.createdAt.toISOString(),
                    returnedAt: reservation.returnedAt?.toISOString() || null,
                    user: { name: reservation.user.name, email: reservation.user.email },
                    material: {
                        name: reservation.material.name,
                        category: reservation.material.category,
                        imageUrl: reservation.material.imageUrl,
                        location: reservation.material.location,
                    },
                }))} />
            </div>
        </div>
    );
}
