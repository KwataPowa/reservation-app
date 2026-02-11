'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, PackageCheck, AlertTriangle, Send } from 'lucide-react';

interface ReturnMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationId: string;
    materialName: string;
    isAdminForce?: boolean;
}

export default function ReturnMaterialModal({
    isOpen,
    onClose,
    reservationId,
    materialName,
    isAdminForce = false,
}: ReturnMaterialModalProps) {
    const router = useRouter();
    const [hasIssue, setHasIssue] = useState(false);
    const [returnNote, setReturnNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasIssue && !returnNote.trim()) {
            setError('Veuillez décrire le problème rencontré.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/reservations/${reservationId}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnNote: returnNote.trim() || null,
                    returnHasIssue: hasIssue,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors du retour');
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
        setHasIssue(false);
        setReturnNote('');
        setError('');
        setSuccess(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="bg-white w-full max-w-md shadow-2xl border border-gray-200 rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <PackageCheck size={20} className="text-[#2566AF]" />
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                                {isAdminForce ? 'Forcer le retour' : 'Rendre le matériel'}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">{materialName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {isAdminForce && (
                        <div className="bg-amber-50 border border-amber-200 rounded px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                            <span>
                                Vous forcez le retour de ce matériel avant la fin de la période de réservation.
                            </span>
                        </div>
                    )}

                    {/* Issue checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={hasIssue}
                            onChange={(e) => setHasIssue(e.target.checked)}
                            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600"
                        />
                        <div>
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                                Signaler un problème
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Câble défectueux, pile vide, pièce manquante, etc.
                            </p>
                        </div>
                    </label>

                    {/* Issue description */}
                    {hasIssue && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="block text-xs font-bold text-red-600 uppercase mb-1.5 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Description du problème
                            </label>
                            <textarea
                                rows={3}
                                value={returnNote}
                                onChange={(e) => setReturnNote(e.target.value)}
                                placeholder="Ex: Le câble USB-C ne fonctionne plus, pile CR2032 à remplacer..."
                                className="w-full border border-red-300 rounded px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none transition-all bg-red-50/30"
                            />
                        </div>
                    )}

                    {/* Feedback */}
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                            <PackageCheck size={16} />
                            Matériel rendu avec succès !
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`px-4 py-2 text-sm font-bold text-white rounded shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 ${hasIssue
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-[#2566AF] hover:bg-[#1A4B82]'
                                }`}
                        >
                            {loading ? (
                                'Traitement...'
                            ) : (
                                <>
                                    <Send size={14} />
                                    Confirmer le retour
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
