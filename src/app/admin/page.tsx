import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminReservationActions from '@/components/AdminReservationActions';
import Link from 'next/link';

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
        <div className="space-y-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold leading-7 text-gray-900">
                    Administration
                </h1>
                <Link
                    href="/admin/materials/new"
                    className="mt-4 sm:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    + Ajouter un matériel
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Matériels enregistrés</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{materialCount}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Réservations en attente</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-yellow-600">{pendingCount}</dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <dt className="truncate text-sm font-medium text-gray-500">Réservations approuvées</dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">{approvedCount}</dd>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium leading-6 text-gray-900">
                        Toutes les réservations
                    </h2>
                </div>
                {reservations.length === 0 ? (
                    <div className="px-4 py-12 text-center text-gray-500">
                        Aucune réservation pour le moment.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Matériel</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Utilisateur</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dates</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Motif</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                                    <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {reservations.map((reservation) => (
                                    <AdminReservationActions
                                        key={reservation.id}
                                        reservation={{
                                            ...reservation,
                                            startDate: reservation.startDate.toISOString(),
                                            endDate: reservation.endDate.toISOString(),
                                            createdAt: reservation.createdAt.toISOString(),
                                            user: { name: reservation.user.name, email: reservation.user.email },
                                            material: { name: reservation.material.name, category: reservation.material.category },
                                        }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
