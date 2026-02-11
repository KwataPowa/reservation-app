'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Calendar, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ReservationFormDialogProps {
  material: Material;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationFormDialog({ material, isOpen, onClose, onSuccess }: ReservationFormDialogProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: material.id,
          startDate,
          endDate,
          purpose,
          location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la reservation');
      }

      toast.success('Demande envoyee !', {
        description: `Reservation de ${material.name} soumise avec succes.`,
      });

      // Reset form
      setStartDate('');
      setEndDate('');
      setPurpose('');
      setLocation('');

      router.refresh();
      onSuccess();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStartDate('');
      setEndDate('');
      setPurpose('');
      setLocation('');
      onClose();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Reserver
          </DialogTitle>
          <DialogDescription>
            {material.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Debut</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fin</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu / Salle</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Salle 204, Chantier A..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Motif / Projet</Label>
            <Textarea
              id="purpose"
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Precisez le contexte d'utilisation..."
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? (
              'Envoi en cours...'
            ) : (
              <>
                <Send className="h-4 w-4" />
                Confirmer la reservation
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Les administrateurs seront notifies de votre demande.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
