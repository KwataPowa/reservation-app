'use client';

import { useState } from 'react';
import { Material } from '@prisma/client';
import Link from 'next/link';
import { MapPin, Tag, DollarSign, Box, FileText, Edit, Calendar, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { materialStatusConfig, type MaterialStatus } from '@/lib/constants';
import ReservationFormDialog from '@/components/reservations/ReservationFormDialog';

interface MaterialDetailDialogProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export default function MaterialDetailDialog({ material, isOpen, onClose, isAdmin }: MaterialDetailDialogProps) {
  const [showReservation, setShowReservation] = useState(false);

  if (!material) return null;

  const config = materialStatusConfig[material.status as MaterialStatus] || materialStatusConfig.AVAILABLE;
  const canReserve = material.status === 'AVAILABLE';
  const components = (material.components as Array<{ name: string; serialNumber: string }>) || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogTitle className="sr-only">{material.name}</DialogTitle>

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
                <h2 className="text-xl font-bold text-foreground leading-tight">{material.name}</h2>
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
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/materials/${material.id}/edit`}>
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Modifier
                  </Link>
                </Button>
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

            {/* Serial / ID info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground lab-mono bg-muted/50 px-3 py-2 rounded-md">
              <span>ID: {material.id.slice(0, 12)}</span>
              {material.serialNumber && <span>S/N: {material.serialNumber}</span>}
            </div>

            <Separator />

            {/* Action */}
            {canReserve ? (
              <Button className="w-full gap-2" size="lg" onClick={() => setShowReservation(true)}>
                <Calendar className="h-4 w-4" />
                Reserver ce materiel
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground bg-muted rounded-md">
                <Ban className="h-4 w-4" />
                Reservation non disponible
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reservation dialog */}
      <ReservationFormDialog
        material={material}
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
        onSuccess={() => {
          setShowReservation(false);
          onClose();
        }}
      />
    </>
  );
}
