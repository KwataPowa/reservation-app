'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackageCheck, AlertTriangle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasIssue && !returnNote.trim()) {
            toast.error('Veuillez décrire le problème rencontré.');
            return;
        }

        setLoading(true);

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

            toast.success('Matériel rendu avec succès !');
            handleClose();
            router.refresh();
        } catch (err: any) {
            toast.error('Erreur', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setHasIssue(false);
        setReturnNote('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-primary" />
                        {isAdminForce ? 'Forcer le retour' : 'Rendre le matériel'}
                    </DialogTitle>
                    <DialogDescription>{materialName}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isAdminForce && (
                        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                            <span>
                                Vous forcez le retour avant la fin de la période de réservation.
                            </span>
                        </div>
                    )}

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="hasIssue"
                            checked={hasIssue}
                            onCheckedChange={(checked) => setHasIssue(checked === true)}
                            className="mt-0.5"
                        />
                        <div>
                            <Label htmlFor="hasIssue" className="text-sm font-medium cursor-pointer">
                                Signaler un problème
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Câble défectueux, pile vide, pièce manquante, etc.
                            </p>
                        </div>
                    </div>

                    {hasIssue && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                            <Label className="text-destructive flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Description du problème
                            </Label>
                            <Textarea
                                rows={3}
                                value={returnNote}
                                onChange={(e) => setReturnNote(e.target.value)}
                                placeholder="Ex: Le câble USB-C ne fonctionne plus..."
                                className="border-destructive/30 focus-visible:ring-destructive/30"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant={hasIssue ? 'destructive' : 'default'}
                            className="gap-2"
                        >
                            {loading ? 'Traitement...' : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Confirmer le retour
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
