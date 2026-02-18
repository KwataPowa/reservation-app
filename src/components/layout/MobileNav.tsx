'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, CalendarDays, FileText, ShieldCheck, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const navItems = [
  { href: '/', label: 'Matériel', icon: Package },
  { href: '/calendar', label: 'Planning', icon: CalendarDays },
];

export default function MobileNav({ isLoggedIn, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const allItems = [
    ...navItems,
    ...(isLoggedIn ? [{ href: '/reservations', label: 'Mes demandes', icon: FileText }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Administration', icon: ShieldCheck }] : []),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-slate-900 border-slate-800 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-md text-white font-bold text-xs tracking-tighter">
            IGG
          </div>
          <span className="font-semibold text-white tracking-tight">
            IGG <span className="text-primary-light font-light">RESA</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {allItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
