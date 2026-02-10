'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface ReservationModalProps {
    material: Material | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReservationModal({ material, isOpen, onClose }: ReservationModalProps) {
    const router = useRouter();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !material) return null;

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
                    purpose
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur technique');
            }

            // Success
            onClose();
            router.refresh();
            // Optional: Show a toast? 
            // For now, modal closes and list updates.
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md lab-panel shadow-2xl relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[#2566AF] leading-none">NOUVELLE RÉSERVATION</h2>
                        <p className="text-xs text-gray-500 mt-1 lab-mono">REF: {material.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 border-l-4 border-[#2566AF] p-3 text-sm text-blue-900 mb-4">
                        <span className="font-bold block text-xs uppercase text-blue-500 mb-1">Matériel sélectionné</span>
                        {material.name}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Début</label>
                            <input
                                type="date"
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full lab-border px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fin</label>
                            <input
                                type="date"
                                required
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                min={startDate || new Date().toISOString().split('T')[0]}
                                className="w-full lab-border px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motif de recherche / Usage</label>
                        <textarea
                            required
                            rows={3}
                            value={purpose}
                            onChange={e => setPurpose(e.target.value)}
                            placeholder="Contexte de l'utilisation..."
                            className="w-full lab-border px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#2566AF] hover:bg-[#1A4B82] shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Traitement...' : 'CONFIRMER LA RÉSERVATION'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
