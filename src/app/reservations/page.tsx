import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/shared/PageHeader';
import MyReservationsList from './MyReservationsList';

export const dynamic = 'force-dynamic';

export default async function MyReservationsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const reservations = await prisma.reservation.findMany({
        where: { userId: session.user.id },
        include: { material: true },
        orderBy: { createdAt: 'desc' },
    });

    const serialized = reservations.map((r) => ({
        id: r.id,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        purpose: r.purpose,
        status: r.status,
        returnedAt: r.returnedAt?.toISOString() || null,
        returnNote: r.returnNote,
        returnHasIssue: r.returnHasIssue,
        materialName: r.material.name,
    }));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mes demandes"
                subtitle="Historique de vos réservations"
            />
            <MyReservationsList reservations={serialized} />
        </div>
    );
}
