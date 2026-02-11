'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, CalendarDays, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  Package,
  CalendarDays,
  FileText,
  ShieldCheck,
} as const;

interface NavLinkProps {
  href: string;
  icon: keyof typeof icons;
  label: string;
  highlight?: boolean;
}

export default function NavLink({ href, icon, label, highlight }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
  const Icon = icons[icon];

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        isActive
          ? highlight
            ? 'bg-primary/15 text-blue-400'
            : 'bg-white/10 text-white'
          : highlight
            ? 'text-blue-400/70 hover:text-blue-400 hover:bg-primary/10'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
