import prisma from '@/lib/prisma';
import CalendarView from '@/components/CalendarView';

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Planning</h1>
                    <p className="mt-1 text-xs text-gray-500 font-mono">VUE D'ENSEMBLE DES RÉSERVATIONS</p>
                </div>
            </div>

            <CalendarView materials={materials} reservations={reservations} />
        </div>
    );
}
