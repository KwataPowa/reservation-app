'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Box, Image as ImageIcon } from 'lucide-react';

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
        budget: '',
        imageUrl: '',
        components: [] as { name: string; serialNumber: string }[],
    });

    const categories = [
        'Casques',
        'Boîtiers mesures physiologiques',
        'Autres',
        'Trackers',
        'Accessoires',
    ];

    const addComponent = () => {
        setForm({
            ...form,
            components: [...form.components, { name: '', serialNumber: '' }]
        });
    };

    const removeComponent = (index: number) => {
        const newComponents = [...form.components];
        newComponents.splice(index, 1);
        setForm({ ...form, components: newComponents });
    };

    const updateComponent = (index: number, field: 'name' | 'serialNumber', value: string) => {
        const newComponents = [...form.components];
        newComponents[index][field] = value;
        setForm({ ...form, components: newComponents });
    };

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

            // Force refresh to update the list
            router.refresh();
            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-4">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#2566AF] hover:text-[#1e5294] transition-colors"
                >
                    ← Retour
                </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">
                        Ajouter un matériel
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Remplissez les informations techniques et l'inventaire des composants.
                    </p>
                </div>

                <div className="px-6 py-5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Information Générale */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Informations Générales</h3>
                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom *</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                    placeholder="Ex: HTC Vive Pro Eye"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="serialNumber" className="block text-xs font-bold text-gray-500 uppercase mb-1">N° de série (Principal)</label>
                                    <input
                                        type="text"
                                        id="serialNumber"
                                        value={form.serialNumber}
                                        onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] font-mono"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="budget" className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget / Financement</label>
                                    <input
                                        type="text"
                                        id="budget"
                                        value={form.budget}
                                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                        placeholder="Ex: IdEx Flavien 2022"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="imageUrl" className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Image</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-grow">
                                            <ImageIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                            <input
                                                type="url"
                                                id="imageUrl"
                                                value={form.imageUrl}
                                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                                className="w-full rounded border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Lien direct vers une image du matériel.</p>
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Classification & Statut</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="location" className="block text-xs font-bold text-gray-500 uppercase mb-1">Emplacement</label>
                                    <input
                                        type="text"
                                        id="location"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-xs font-bold text-gray-500 uppercase mb-1">Catégorie</label>
                                    <select
                                        id="category"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-xs font-bold text-gray-500 uppercase mb-1">Statut Initial</label>
                                    <select
                                        id="status"
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                    >
                                        <option value="AVAILABLE">Disponible</option>
                                        <option value="MAINTENANCE">En maintenance</option>
                                        <option value="UNAVAILABLE">Indisponible</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Composants / Sous-équipements */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Box size={16} /> Composants du Kit
                                </h3>
                                <button
                                    type="button"
                                    onClick={addComponent}
                                    className="flex items-center gap-1 text-xs font-bold text-[#2566AF] hover:text-[#1e5294} transition-colors"
                                >
                                    <Plus size={14} /> AJOUTER UN COMPOSANT
                                </button>
                            </div>

                            {form.components.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded text-gray-400 text-sm">
                                    Aucun composant ajouté (ex: manettes, câbles, stations...).
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.components.map((comp, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded border border-gray-100">
                                            <span className="text-xs font-bold text-gray-400 mt-2.5">#{idx + 1}</span>
                                            <div className="flex-grow grid grid-cols-2 gap-3">
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Nom de l'élément (ex: Manette Droite)"
                                                        value={comp.name}
                                                        onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF]"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="N° de série"
                                                        value={comp.serialNumber}
                                                        onChange={(e) => updateComponent(idx, 'serialNumber', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeComponent(idx)}
                                                className="text-gray-400 hover:text-red-500 mt-1.5"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 border border-red-200 p-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded bg-white border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wide"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded bg-[#2566AF] px-4 py-2 text-sm font-bold text-white hover:bg-[#1e5294] disabled:opacity-50 transition-colors uppercase tracking-wide shadow-sm"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer le matériel'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
