'use client';

import { Material } from '@prisma/client';
import { MapPin, Tag, Box, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
        className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden h-full"
        onClick={() => onClick(material)}
      >
        {/* Image or placeholder */}
        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
          {material.imageUrl ? (
            <img
              src={material.imageUrl}
              alt={material.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
              <Box className="h-10 w-10" />
            </div>
          )}
          <Badge
            variant="outline"
            className={cn('absolute top-2 right-2 text-[10px] font-semibold border', config.className)}
          >
            {config.label}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
            {material.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {material.description || 'Aucune description disponible.'}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {material.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> {material.location}
              </span>
            )}
            {material.category && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Tag className="h-3 w-3" /> {material.category}
              </span>
            )}
            {material.budget && (
              <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                <DollarSign className="h-3 w-3" /> {material.budget}
              </span>
            )}
            {components.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Box className="h-3 w-3" /> {components.length} élément{components.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
