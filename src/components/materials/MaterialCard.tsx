'use client';

import { Material } from '@prisma/client';
import { MapPin, Tag, Box, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, getContrastColor } from '@/lib/utils';
import { materialStatusConfig, type MaterialStatus } from '@/lib/constants';
import { motion } from 'framer-motion';

interface MaterialCardProps {
  material: Material;
  onClick: (material: Material) => void;
}

export default function MaterialCard({ material, onClick }: MaterialCardProps) {
  const config = materialStatusConfig[material.status as MaterialStatus] || materialStatusConfig.AVAILABLE;
  const components = Array.isArray(material.components) ? material.components : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all duration-200 overflow-hidden h-full"
        onClick={() => onClick(material)}
      >
        {/* Image or placeholder */}
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {material.imageUrl ? (
            <img
              src={material.imageUrl}
              alt={material.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
              <Box className="h-16 w-16" />
            </div>
          )}
          <Badge
            variant="outline"
            className={cn('absolute top-3 right-3 text-xs font-semibold border-2 shadow-sm', config.className)}
          >
            {config.label}
          </Badge>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Title & Category */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {(material.badgeColor || material.badgeNumber != null) && (
                <span
                  className="inline-flex items-center justify-center rounded-full font-bold shrink-0 leading-none"
                  style={{
                    backgroundColor: material.badgeColor || '#6b7280',
                    color: material.badgeColor ? getContrastColor(material.badgeColor) : '#ffffff',
                    width: material.badgeNumber != null ? '1.35rem' : '0.65rem',
                    height: material.badgeNumber != null ? '1.35rem' : '0.65rem',
                    fontSize: '0.65rem',
                  }}
                >
                  {material.badgeNumber ?? ''}
                </span>
              )}
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {material.name}
              </h3>
            </div>
            {material.category && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                <span>{material.category}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {material.description || 'Aucune description disponible.'}
          </p>

          {/* Meta information */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t">
            {material.location && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="font-medium">{material.location}</span>
              </span>
            )}
            {material.budget && (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{material.budget}</span>
              </span>
            )}
            {components.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Box className="h-3.5 w-3.5" />
                <span>{components.length} composant{components.length > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
