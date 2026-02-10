import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { label: 'Approuvée', color: 'bg-green-100 text-green-800' },
    REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-800' },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-100 text-gray-800' },
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
            <h1 className="text-2xl font-bold leading-7 text-gray-900">
                Mes Réservations
            </h1>

            {reservations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Vous n&apos;avez aucune réservation.</p>
                    <Link
                        href="/"
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        Parcourir le matériel
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {reservations.map((reservation) => {
                            const status = statusLabels[reservation.status] || statusLabels.PENDING;
                            return (
                                <li key={reservation.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="truncate text-sm font-medium text-indigo-600">
                                                {reservation.material.name}
                                            </p>
                                            <div className="ml-2 flex flex-shrink-0">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    📅 {new Date(reservation.startDate).toLocaleDateString('fr-FR')} → {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            {reservation.purpose && (
                                                <p className="mt-2 text-sm text-gray-500 sm:mt-0">
                                                    {reservation.purpose}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
