import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Approuvée', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-600' },
};

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Mes Réservations</h1>
                <Link
                    href="/"
                    className="text-sm font-medium text-[#2566AF] hover:text-[#1e5294] transition-colors"
                >
                    ← Retour au matériel
                </Link>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                    <p className="text-gray-400 mb-3">Vous n&apos;avez aucune réservation.</p>
                    <Link
                        href="/"
                        className="text-sm font-medium text-[#2566AF] hover:text-[#1e5294]"
                    >
                        Parcourir le matériel
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {reservations.map((reservation) => {
                        const status = statusLabels[reservation.status] || statusLabels.PENDING;
                        return (
                            <div key={reservation.id} className="px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {reservation.material.name}
                                    </p>
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                    <span>
                                        📅 {new Date(reservation.startDate).toLocaleDateString('fr-FR')} → {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                                    </span>
                                    {reservation.purpose && (
                                        <span className="text-gray-400">• {reservation.purpose}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
