'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReservationForm({ materialId, materialName }: { materialId: string; materialName: string }) {
    const router = useRouter();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ materialId, startDate, endDate, purpose }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la réservation');
            }

            router.push('/reservations?success=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-600">Matériel</label>
                <p className="mt-1 text-base font-semibold text-gray-900">{materialName}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-600">
                        Date de début
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-600">
                        Date de fin
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-600">
                    Motif de la réservation
                </label>
                <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                    placeholder="Décrivez l'usage prévu du matériel..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                />
            </div>

            {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-[#2566AF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5294] disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Réservation...' : 'Réserver'}
                </button>
            </div>
        </form>
    );
}
