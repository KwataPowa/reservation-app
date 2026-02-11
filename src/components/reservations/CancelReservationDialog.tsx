'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CancelReservationDialogProps {
  reservationId: string;
  materialName: string;
  status: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function CancelReservationDialog({
  reservationId,
  materialName,
  status,
  trigger,
  onSuccess,
}: CancelReservationDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'annulation');
      }

      toast.success('Réservation annulée');
      onSuccess?.();
      router.refresh();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const isApproved = status === 'APPROVED';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            Annuler
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isApproved && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            Annuler la réservation ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isApproved ? (
              <>
                Cette réservation de <strong>{materialName}</strong> a déjà été <strong>approuvée</strong>.
                L&apos;annulation libérera le matériel pour cette période.
              </>
            ) : (
              <>
                Annuler la demande de réservation de <strong>{materialName}</strong> ?
                Cette action est irréversible.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Retour</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Annulation...' : 'Confirmer l\'annulation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
