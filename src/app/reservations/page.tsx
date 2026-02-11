import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Mes Demandes</h1>
                    <p className="mt-1 text-xs text-gray-500 lab-mono">HISTORIQUE DES RÉSERVATIONS</p>
                </div>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#2566AF] transition-colors"
                >
                    <ArrowLeft size={14} />
                    Retour
                </Link>
            </div>

            <MyReservationsList reservations={serialized} />
        </div>
    );
}
