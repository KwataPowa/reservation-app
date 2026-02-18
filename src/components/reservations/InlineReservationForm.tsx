'use client';

import { useState, useEffect, useMemo } from 'react';
import { Material, Reservation } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fr } from 'react-day-picker/locale';
import type { Matcher } from 'react-day-picker';

interface InlineReservationFormProps {
  material: Material;
  onSuccess: () => void;
}

interface ReservationPeriod {
  start: Date;
  end: Date;
  status: string;
}

export default function InlineReservationForm({ material, onSuccess }: InlineReservationFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [purpose, setPurpose] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<ReservationPeriod[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  // Fetch existing reservations for this material
  useEffect(() => {
    fetch(`/api/materials/${material.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.reservations) {
          const periods = (data.reservations as Reservation[])
            .filter((r: Reservation) => r.status === 'APPROVED' || r.status === 'PENDING')
            .map((r: Reservation) => ({
              start: new Date(r.startDate),
              end: new Date(r.endDate),
              status: r.status,
            }));
          setReservations(periods);
        }
      })
      .catch(() => { /* silently ignore */ });
  }, [material.id]);

  // Build disabled date ranges for the calendar
  const disabledDates: Matcher[] = useMemo(() => {
    const matchers: Matcher[] = [
      { before: new Date() }, // disable past dates
    ];
    reservations
      .filter(r => r.status === 'APPROVED')
      .forEach(r => {
        matchers.push({ from: r.start, to: r.end });
      });
    return matchers;
  }, [reservations]);

  // Build modifiers for pending reservations (shown but not disabled)
  const pendingDates: Matcher[] = useMemo(() => {
    return reservations
      .filter(r => r.status === 'PENDING')
      .map(r => ({ from: r.start, to: r.end }));
  }, [reservations]);

  const approvedDates: Matcher[] = useMemo(() => {
    return reservations
      .filter(r => r.status === 'APPROVED')
      .map(r => ({ from: r.start, to: r.end }));
  }, [reservations]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const toDateString = (date: Date | undefined) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: material.id,
          startDate: toDateString(startDate),
          endDate: toDateString(endDate),
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

  const hasPending = pendingDates.length > 0;
  const hasApproved = approvedDates.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Reserver
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{material.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {/* Start date picker */}
          <div className="space-y-2">
            <Label>Debut</Label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDate(startDate) : 'Choisir une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={fr}
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date && endDate && date > endDate) setEndDate(undefined);
                    setStartOpen(false);
                  }}
                  disabled={disabledDates}
                  modifiers={{
                    pending: pendingDates,
                    approved: approvedDates,
                  }}
                  modifiersClassNames={{
                    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                    approved: 'bg-red-100 text-red-400 line-through dark:bg-red-900/30 dark:text-red-400',
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End date picker */}
          <div className="space-y-2">
            <Label>Fin</Label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? formatDate(endDate) : 'Choisir une date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={fr}
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setEndOpen(false);
                  }}
                  disabled={[
                    ...disabledDates,
                    ...(startDate ? [{ before: startDate }] : []),
                  ]}
                  modifiers={{
                    pending: pendingDates,
                    approved: approvedDates,
                  }}
                  modifiersClassNames={{
                    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                    approved: 'bg-red-100 text-red-400 line-through dark:bg-red-900/30 dark:text-red-400',
                  }}
                  defaultMonth={startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Legend */}
        {(hasPending || hasApproved) && (
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            {hasApproved && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
                Reserve
              </span>
            )}
            {hasPending && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" />
                En attente
              </span>
            )}
          </div>
        )}

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

        <Button type="submit" disabled={loading || !startDate || !endDate} className="w-full gap-2">
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
