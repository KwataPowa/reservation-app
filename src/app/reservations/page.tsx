import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={12} /> },
    APPROVED: { label: 'Approuvée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    REJECTED: { label: 'Refusée', color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={12} /> },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: <Ban size={12} /> },
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

            {reservations.length === 0 ? (
                <div className="bg-white border border-gray-200 text-center py-12">
                    <p className="text-gray-400 text-sm mb-3">Aucune réservation enregistrée.</p>
                    <Link href="/" className="text-sm font-medium text-[#2566AF] hover:text-[#1A4B82]">
                        Parcourir le matériel
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 divide-y divide-gray-100">
                    {reservations.map((reservation) => {
                        const config = statusConfig[reservation.status] || statusConfig.PENDING;
                        return (
                            <div key={reservation.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {reservation.material.name}
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays size={12} className="text-gray-400" />
                                            {new Date(reservation.startDate).toLocaleDateString('fr-FR')} — {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                                        </span>
                                        {reservation.purpose && (
                                            <span className="text-gray-400 truncate max-w-[250px]">{reservation.purpose}</span>
                                        )}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-medium shrink-0 ${config.color}`}>
                                    {config.icon}
                                    {config.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
