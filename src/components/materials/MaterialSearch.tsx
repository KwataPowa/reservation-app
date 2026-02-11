'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MaterialSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categories: string[];
}

const statusOptions = [
  { value: 'ALL', label: 'Tous' },
  { value: 'AVAILABLE', label: 'Disponible', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { value: 'MAINTENANCE', label: 'Maintenance', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { value: 'UNAVAILABLE', label: 'Indisponible', className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
];

export default function MaterialSearch({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  categories,
}: MaterialSearchProps) {
  const hasFilters = search || categoryFilter !== 'ALL' || statusFilter !== 'ALL';

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un matériel..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

        {/* Category filters */}
        <Badge
          variant={categoryFilter === 'ALL' ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer text-xs',
            categoryFilter === 'ALL' && 'bg-primary text-primary-foreground'
          )}
          onClick={() => onCategoryChange('ALL')}
        >
          Tous
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={categoryFilter === cat ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer text-xs',
              categoryFilter === cat && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </Badge>
        ))}

        {/* Separator */}
        <div className="h-4 w-px bg-border mx-1" />

        {/* Status filters */}
        {statusOptions.map((opt) => (
          <Badge
            key={opt.value}
            variant="outline"
            className={cn(
              'cursor-pointer text-xs transition-colors',
              statusFilter === opt.value
                ? opt.className || 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-accent'
            )}
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}

        {/* Clear filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground ml-auto"
            onClick={() => {
              onSearchChange('');
              onCategoryChange('ALL');
              onStatusChange('ALL');
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
