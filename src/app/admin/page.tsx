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
        <div className="space-y-6">
            <PageHeader
                title="Administration"
                subtitle="Gestion des ressources et des demandes"
            >
                <Button asChild className="gap-2">
                    <Link href="/admin/materials/new">
                        <Plus className="h-4 w-4" />
                        Nouveau matériel
                    </Link>
                </Button>
            </PageHeader>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total équipements</p>
                            <p className="text-2xl font-bold lab-mono mt-1">{materialCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">En attente</p>
                            <p className="text-2xl font-bold lab-mono mt-1 text-amber-600">{pendingCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Actives</p>
                            <p className="text-2xl font-bold lab-mono mt-1 text-emerald-600">{approvedCount}</p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reservations list */}
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
    );
}
