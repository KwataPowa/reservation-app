import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminReservationActions from '@/components/AdminReservationActions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await auth();
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
                <Link
                    href="/admin/materials/new"
                    className="inline-flex items-center rounded-md bg-[#2566AF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5294] transition-colors"
                >
                    + Ajouter un matériel
                </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <p className="text-sm font-medium text-gray-500">Matériels enregistrés</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{materialCount}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <p className="text-sm font-medium text-gray-500">En attente</p>
                    <p className="mt-1 text-3xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <p className="text-sm font-medium text-gray-500">Approuvées</p>
                    <p className="mt-1 text-3xl font-bold text-green-600">{approvedCount}</p>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Toutes les réservations
                    </h2>
                </div>
                {reservations.length === 0 ? (
                    <div className="px-5 py-12 text-center text-gray-400">
                        Aucune réservation pour le moment.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 pl-5 pr-3 text-left text-xs font-semibold text-gray-500 uppercase">Matériel</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dates</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Motif</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
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
