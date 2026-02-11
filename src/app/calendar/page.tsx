import prisma from '@/lib/prisma';
import CalendarView from '@/components/CalendarView';
import PageHeader from '@/components/shared/PageHeader';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    const materials = await prisma.material.findMany({
        orderBy: { name: 'asc' },
    });

    const reservations = await prisma.reservation.findMany({
        where: {
            status: { in: ['APPROVED', 'PENDING'] }
        },
        include: {
            material: true,
            user: {
                select: { name: true, email: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <PageHeader
                title="Planning"
                subtitle="Vue d'ensemble des réservations"
            />
            <CalendarView materials={materials} reservations={reservations} />
        </div>
    );
}
