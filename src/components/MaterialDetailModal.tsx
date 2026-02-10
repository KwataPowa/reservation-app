'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { X, MapPin, Tag, Hash, Calendar, FileText, Send, AlertCircle } from 'lucide-react';

interface MaterialDetailModalProps {
    material: Material | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'Disponible', color: 'text-emerald-600' },
    MAINTENANCE: { label: 'En maintenance', color: 'text-amber-600' },
    UNAVAILABLE: { label: 'Indisponible', color: 'text-red-600' },
};

export default function MaterialDetailModal({ material, isOpen, onClose }: MaterialDetailModalProps) {
    const router = useRouter();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen || !material) return null;

    const config = statusConfig[material.status] || statusConfig.AVAILABLE;
    const canReserve = material.status === 'AVAILABLE';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    materialId: material.id,
                    startDate,
                    endDate,
                    purpose,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la réservation');
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setStartDate('');
                setEndDate('');
                setPurpose('');
                router.refresh();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess(false);
        setStartDate('');
        setEndDate('');
        setPurpose('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleClose}>
            <div className="bg-white w-full max-w-lg shadow-2xl border border-gray-200 relative" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{material.name}</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="lab-mono text-gray-400 text-xs flex items-center gap-1">
                                <Hash size={11} /> {material.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Detail Section */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {material.description || 'Aucune description disponible pour cet équipement.'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} className="text-gray-400 shrink-0" />
                            <span>{material.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Tag size={14} className="text-gray-400 shrink-0" />
                            <span>{material.category}</span>
                        </div>
                        {material.serialNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                                <FileText size={14} className="text-gray-400 shrink-0" />
                                <span className="lab-mono">S/N: {material.serialNumber}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reservation Form or Unavailable Message */}
                {canReserve ? (
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} />
                            Nouvelle réservation
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date de fin</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Motif d&apos;utilisation</label>
                            <textarea
                                required
                                rows={2}
                                value={purpose}
                                onChange={e => setPurpose(e.target.value)}
                                placeholder="Décrivez le contexte d'utilisation..."
                                className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] outline-none resize-none"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-xs font-medium">
                                Demande de réservation envoyée avec succès.
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
                            >
                                Fermer
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="px-4 py-2 text-sm font-semibold text-white bg-[#2566AF] hover:bg-[#1A4B82] disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                <Send size={14} />
                                {loading ? 'Envoi...' : 'Envoyer la demande'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="px-6 py-8 text-center">
                        <p className="text-sm text-gray-500">
                            Cet équipement n&apos;est pas disponible à la réservation pour le moment.
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
