import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  PackageCheck,
  type LucideIcon,
} from 'lucide-react';

// ── Material Status ──────────────────────────────────────────────

export type MaterialStatus = 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';

export const materialStatusConfig: Record<
  MaterialStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  AVAILABLE: {
    label: 'Disponible',
    variant: 'default',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    variant: 'default',
    className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  UNAVAILABLE: {
    label: 'Indisponible',
    variant: 'default',
    className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  },
};

// ── Reservation Status ───────────────────────────────────────────

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'RETURNED';

export const reservationStatusConfig: Record<
  ReservationStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  APPROVED: {
    label: 'Approuvée',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  REJECTED: {
    label: 'Refusée',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  CANCELLED: {
    label: 'Annulée',
    icon: Ban,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  RETURNED: {
    label: 'Rendu',
    icon: PackageCheck,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

// ── Date Formatting ──────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

// ── Material Categories ──────────────────────────────────────────

export const MATERIAL_CATEGORIES = [
  'Casques',
  'Boîtiers mesures physiologiques',
  'Trackers',
  'Accessoires',
  'Autres',
] as const;
