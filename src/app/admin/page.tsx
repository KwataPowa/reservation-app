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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Panneau Administration</h1>
                    <p className="mt-1 text-xs text-gray-500 font-mono">GESTION DES RESSOURCES ET DEMANDES</p>
                </div>
                <Link
                    href="/admin/materials/new"
                    className="inline-flex items-center gap-2 bg-[#2566AF] text-white px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-[#1A4B82] transition-colors shadow-sm"
                >
                    <span className="text-lg leading-none">+</span> Nouveau Matériel
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total Équipements" value={materialCount} icon="📦" />
                <StatCard label="Demandes en Attente" value={pendingCount} color="text-yellow-600" bg="bg-yellow-50" icon="⚠️" />
                <StatCard label="Réservations Actives" value={approvedCount} color="text-green-600" bg="bg-green-50" icon="✅" />
            </div>

            {/* Reservations Panel */}
            <div className="bg-white lab-panel">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Flux des Réservations
                    </h2>
                    <span className="text-xs font-mono text-gray-400">{reservations.length} ENREGISTREMENTS</span>
                </div>

                {reservations.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 font-mono text-sm">Aucune donnée disponible.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Équipement</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Demandeur</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Période</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Motif</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
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

function StatCard({ label, value, color = "text-gray-900", bg = "bg-white", icon }: { label: string, value: number, color?: string, bg?: string, icon: string }) {
    return (
        <div className={`${bg} lab-panel p-5 flex items-center justify-between`}>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                <p className={`mt-1 text-3xl font-mono font-bold ${color}`}>{value}</p>
            </div>
            <span className="text-2xl opacity-20 grayscale">{icon}</span>
        </div>
    );
}
