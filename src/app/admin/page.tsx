import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminReservationActions from '@/components/AdminReservationActions';
import Link from 'next/link';
import { Plus, Package, Clock, CheckCircle, Edit } from 'lucide-react';

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

    const materials = await prisma.material.findMany({
        orderBy: { name: 'asc' },
    });

    const materialCount = materials.length;
    const pendingCount = reservations.filter(r => r.status === 'PENDING').length;
    const approvedCount = reservations.filter(r => r.status === 'APPROVED').length;

    return (
        <div className="space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reservations Table */}
                <div className="bg-white border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Dernières Réservations</h2>
                        <span className="text-xs lab-mono text-gray-400">{reservations.length}</span>
                    </div>

                    {reservations.length === 0 ? (
                        <div className="p-12 text-center flex-grow flex items-center justify-center">
                            <p className="text-gray-400 text-sm">Aucune réservation.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Détails</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Demandeur</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date/Statut</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
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

                {/* Materials List */}
                <div className="bg-white border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/80 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Inventaire</h2>
                        <span className="text-xs lab-mono text-gray-400">{materials.length} items</span>
                    </div>

                    {materials.length === 0 ? (
                        <div className="p-12 text-center flex-grow flex items-center justify-center">
                            <p className="text-gray-400 text-sm">Aucun matériel.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-[600px] flex-grow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nom / SN</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gérer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {materials.map((material) => (
                                        <tr key={material.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{material.name}</div>
                                                        <div className="text-xs text-gray-400 lab-mono">{material.serialNumber || '—'}</div>
                                                    </div>
                                                    <StatusBadge status={material.status} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/admin/materials/${material.id}/edit`}
                                                    className="inline-flex items-center gap-1 text-gray-400 hover:text-[#2566AF] transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    <span className="text-xs font-medium">Modifier</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string, label: string }> = {
        AVAILABLE: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Dispo' },
        MAINTENANCE: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Maint.' },
        UNAVAILABLE: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Indispo' },
    };

    const item = config[status] || { color: 'bg-gray-50 text-gray-600', label: status };

    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${item.color}`}>
            {item.label}
        </span>
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
