'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Calendar, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface InlineReservationFormProps {
  material: Material;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InlineReservationForm({ material, onSuccess, onCancel }: InlineReservationFormProps) {
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

      router.refresh();
      onSuccess();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Reserver
          </h3>
          <p className="text-xs text-muted-foreground truncate">{material.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="inline-startDate">Debut</Label>
            <Input
              id="inline-startDate"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inline-endDate">Fin</Label>
            <Input
              id="inline-endDate"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inline-location">Lieu / Salle</Label>
          <Input
            id="inline-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Salle 204, Chantier A..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inline-purpose">Motif / Projet</Label>
          <Textarea
            id="inline-purpose"
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
    </div>
  );
}
