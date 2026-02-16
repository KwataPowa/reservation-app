import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminReservationList from './AdminReservationList';
import PageHeader from '@/components/shared/PageHeader';
import Link from 'next/link';
import { Plus, Package, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
                    <p className="text-muted-foreground mt-1">Gestion des ressources et des demandes</p>
                </div>
                <Button asChild size="default" className="gap-2">
                    <Link href="/admin/materials/new">
                        <Plus className="h-4 w-4" />
                        Nouveau matériel
                    </Link>
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-blue-900/70 dark:text-blue-100/70">Total équipements</p>
                                </div>
                                <p className="text-3xl font-bold lab-mono text-blue-900 dark:text-blue-50">{materialCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <p className="text-sm font-medium text-amber-900/70 dark:text-amber-100/70">En attente</p>
                                </div>
                                <p className="text-3xl font-bold lab-mono text-amber-900 dark:text-amber-50">{pendingCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-900/70 dark:text-emerald-100/70">Actives</p>
                                </div>
                                <p className="text-3xl font-bold lab-mono text-emerald-900 dark:text-emerald-50">{approvedCount}</p>
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
