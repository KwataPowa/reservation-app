import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminReservationActions from '@/components/AdminReservationActions';
import Link from 'next/link';
import { Plus, Package, Clock, CheckCircle } from 'lucide-react';

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
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Administration</h1>
                    <p className="mt-1 text-xs text-gray-500 lab-mono">GESTION DES RESSOURCES ET DEMANDES</p>
                </div>
                <Link
                    href="/admin/materials/new"
                    className="inline-flex items-center gap-2 bg-[#2566AF] text-white px-4 py-2 text-sm font-semibold hover:bg-[#1A4B82] transition-colors"
                >
                    <Plus size={16} />
                    Nouveau matériel
                </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total équipements" value={materialCount} icon={<Package size={20} className="text-gray-300" />} />
                <StatCard label="En attente" value={pendingCount} icon={<Clock size={20} className="text-amber-300" />} valueColor="text-amber-600" />
                <StatCard label="Actives" value={approvedCount} icon={<CheckCircle size={20} className="text-emerald-300" />} valueColor="text-emerald-600" />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Réservations</h2>
                    <span className="text-xs lab-mono text-gray-400">{reservations.length} enregistrements</span>
                </div>

                {reservations.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 text-sm">Aucune réservation enregistrée.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Équipement</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Demandeur</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Période</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Motif</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
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

function StatCard({ label, value, icon, valueColor = "text-gray-900" }: { label: string; value: number; icon: React.ReactNode; valueColor?: string }) {
    return (
        <div className="bg-white border border-gray-200 shadow-sm p-5 flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <p className={`mt-1 text-3xl font-bold lab-mono ${valueColor}`}>{value}</p>
            </div>
            {icon}
        </div>
    );
}
