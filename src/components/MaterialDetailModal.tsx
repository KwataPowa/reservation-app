'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { X, MapPin, Tag, Hash, Calendar, FileText, Send, AlertCircle, Box, DollarSign, Image as ImageIcon, Edit } from 'lucide-react';
import Link from 'next/link';

interface MaterialDetailModalProps {
    material: Material | null;
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}


const statusConfig: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'Disponible', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    MAINTENANCE: { label: 'En maintenance', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    UNAVAILABLE: { label: 'Indisponible', color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function MaterialDetailModal({ material, isOpen, onClose, isAdmin }: MaterialDetailModalProps) {
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
    // @ts-ignore
    const components = (material.components as Array<{ name: string; serialNumber: string }>) || [];

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
                handleClose();
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleClose}>
            <div className="bg-white w-full max-w-4xl shadow-2xl border border-gray-200 flex flex-col md:flex-row max-h-[90vh] overflow-hidden rounded-lg" onClick={e => e.stopPropagation()}>

                {/* Left Panel: Image & Details */}
                <div className="w-full md:w-1/2 bg-gray-50/50 border-r border-gray-200 overflow-y-auto custom-scrollbar p-6">
                    {/* Image Placeholder */}
                    <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center border border-gray-300 relative overflow-hidden">
                        {material.imageUrl ? (
                            <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <ImageIcon size={48} strokeWidth={1} />
                                <span className="text-xs uppercase mt-2 font-medium">Aucune image</span>
                            </div>
                        )}
                        <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border shadow-sm ${config.color}`}>
                            {config.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{material.name}</h2>
                        {isAdmin && (
                            <Link
                                href={`/admin/materials/${material.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-[#2566AF] hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1"
                                title="Modifier ce matériel"
                            >
                                <Edit size={18} />
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">
                            <Tag size={12} /> {material.category || 'Non classé'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">
                            <MapPin size={12} /> {material.location || 'N/A'}
                        </span>
                        {material.budget && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-medium text-blue-700">
                                <DollarSign size={12} /> {material.budget}
                            </span>
                        )}
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-6">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <FileText size={14} /> Description
                        </h4>
                        <p>{material.description || 'Aucune description détaillée.'}</p>
                    </div>

                    {/* Technical Specs / Components */}
                    {components.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Box size={14} /> Contenu du kit ({components.length})
                            </h4>
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-100 text-gray-500 font-semibold uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Élément</th>
                                            <th className="px-3 py-2 text-right">S/N</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {components.map((comp, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 text-gray-700 font-medium">{comp.name}</td>
                                                <td className="px-3 py-2 text-right text-gray-500 lab-mono">{comp.serialNumber || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-100 p-3 rounded font-mono text-xs text-gray-500 flex justify-between">
                        <span>ID: {material.id}</span>
                        <span>S/N: {material.serialNumber || 'N/A'}</span>
                    </div>
                </div>

                {/* Right Panel: Reservation Form */}
                <div className="w-full md:w-1/2 flex flex-col p-6 bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
                            <Calendar size={20} className="text-[#2566AF]" />
                            Réserver
                        </h3>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    {canReserve ? (
                        <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Début</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Motif / Projet</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={purpose}
                                    onChange={e => setPurpose(e.target.value)}
                                    placeholder="Merci de préciser le contexte de l'utilisation..."
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#2566AF] focus:ring-1 focus:ring-[#2566AF] outline-none resize-none transition-all"
                                />
                            </div>

                            <div className="mt-auto">
                                {error && (
                                    <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                                        <Send size={16} />
                                        Demande envoyée avec succès !
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full py-3 px-4 bg-[#2566AF] hover:bg-[#1A4B82] text-white font-bold rounded shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                                >
                                    {loading ? (
                                        <>Traitement en cours...</>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Confirmer la réservation
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    Une notification sera envoyée aux administrateurs.
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded border border-dashed border-gray-200">
                            <span className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-4">
                                <Ban size={24} />
                            </span>
                            <h4 className="text-gray-900 font-bold mb-2">Réservation non disponible</h4>
                            <p className="text-sm text-gray-500">
                                Cet équipement est actuellement indisponible ou en maintenance.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Ban({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m4.9 4.9 14.2 14.2" />
        </svg>
    )
}
