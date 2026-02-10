'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMaterialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        description: '',
        serialNumber: '',
        location: 'C120',
        category: 'Casques',
        status: 'AVAILABLE',
    });

    const categories = [
        'Casques',
        'Boîtiers mesures physiologiques',
        'Autres',
        'Trackers',
        'Accessoires',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la création');
            }

            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-4">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#2566AF] hover:text-[#1e5294] transition-colors"
                >
                    ← Retour
                </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Ajouter un matériel
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Nom *</label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-600">Description</label>
                            <textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-600">N° de série</label>
                                <input
                                    type="text"
                                    id="serialNumber"
                                    value={form.serialNumber}
                                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-600">Emplacement</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-600">Catégorie</label>
                                <select
                                    id="category"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-600">Statut</label>
                                <select
                                    id="status"
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                >
                                    <option value="AVAILABLE">Disponible</option>
                                    <option value="MAINTENANCE">En maintenance</option>
                                    <option value="UNAVAILABLE">Indisponible</option>
                                </select>
                            </div>
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
                                {loading ? 'Création...' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
