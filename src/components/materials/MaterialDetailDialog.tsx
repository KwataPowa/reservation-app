'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Tag, DollarSign, Box, FileText, Edit, Ban, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn, getContrastColor } from '@/lib/utils';
import { materialStatusConfig, type MaterialStatus } from '@/lib/constants';
import InlineReservationForm from '@/components/reservations/InlineReservationForm';
import { toast } from 'sonner';

interface MaterialDetailDialogProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function MaterialDetailDialog({ material, isOpen, onClose, isAdmin }: MaterialDetailDialogProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!material) return null;

  const config = materialStatusConfig[material.status as MaterialStatus] || materialStatusConfig.AVAILABLE;
  const canReserve = material.status === 'AVAILABLE';
  const components = (material.components as Array<{ name: string; serialNumber: string }>) || [];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/materials/${material.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
      toast.success('Materiel supprime', {
        description: `${material.name} a ete supprime.`,
      });
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={cn(
            'max-h-[85vh] overflow-y-auto p-0 gap-0',
            canReserve ? 'sm:max-w-4xl' : 'sm:max-w-2xl'
          )}
        >
          <DialogTitle className="sr-only">{material.name}</DialogTitle>

          <div className={cn(
            'flex',
            canReserve ? 'flex-col md:flex-row' : 'flex-col'
          )}>
            {/* Left panel: Material detail */}
            <div className="flex-1 min-w-0">
              {/* Image */}
              <div className="aspect-[21/9] bg-muted relative overflow-hidden">
                {material.imageUrl ? (
                  <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Box className="h-16 w-16" />
                  </div>
                )}
                <Badge
                  variant="outline"
                  className={cn('absolute top-3 right-3 font-semibold border shadow-sm', config.className)}
                >
                  {config.label}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {(material.badgeColor || material.badgeNumber != null) && (
                        <span
                          className="inline-flex items-center justify-center rounded-full font-bold shrink-0 leading-none"
                          style={{
                            backgroundColor: material.badgeColor || '#6b7280',
                            color: material.badgeColor ? getContrastColor(material.badgeColor) : '#ffffff',
                            width: material.badgeNumber != null ? '1.5rem' : '0.75rem',
                            height: material.badgeNumber != null ? '1.5rem' : '0.75rem',
                            fontSize: '0.7rem',
                          }}
                        >
                          {material.badgeNumber ?? ''}
                        </span>
                      )}
                      <h2 className="text-xl font-bold text-foreground leading-tight">{material.name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {material.category && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3" /> {material.category}
                        </span>
                      )}
                      {material.location && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {material.location}
                        </span>
                      )}
                      {material.budget && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                          <DollarSign className="h-3 w-3" /> {material.budget}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/materials/${material.id}/edit`}>
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Modifier
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Description */}
                {material.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Description
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {material.description}
                    </p>
                  </div>
                )}

                {/* Components table */}
                {components.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Box className="h-3.5 w-3.5" /> Contenu du kit ({components.length})
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Element</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">S/N</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {components.map((comp, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-sm">{comp.name}</td>
                              <td className="px-3 py-2 text-right text-xs text-muted-foreground lab-mono">
                                {comp.serialNumber || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Unavailable message (only when not reservable) */}
                {!canReserve && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground bg-muted rounded-md">
                      <Ban className="h-4 w-4" />
                      Reservation non disponible
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right panel: Reservation form (always visible when available) */}
            {canReserve && (
              <div className="border-t md:border-t-0 md:border-l p-6 md:w-[360px] shrink-0">
                <InlineReservationForm
                  material={material}
                  onSuccess={onClose}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce materiel ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Le materiel <strong>{material.name}</strong> et
              toutes ses reservations associees seront definitivement supprimes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
