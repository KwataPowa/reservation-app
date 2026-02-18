import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Package, CalendarDays, FileText, ShieldCheck, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileNav from './MobileNav';
import UserMenu from './UserMenu';
import NavLink from './NavLink';

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-950 border-b border-slate-800/50 z-50 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Logo + Mobile Menu */}
      <div className="flex items-center gap-3">
        <MobileNav
          isLoggedIn={!!user}
          isAdmin={user?.role === 'ADMIN'}
        />
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/igg-icon.png" alt="IGG" width={28} height={28} className="w-7 h-7 rounded-md object-contain" />
          <span className="font-semibold text-white tracking-tight text-sm hidden sm:inline-block">
            IGG <span className="text-blue-400 font-light">RESA</span>
          </span>
        </Link>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        <NavLink href="/" icon="Package" label="Matériel" />
        <NavLink href="/calendar" icon="CalendarDays" label="Planning" />
        {user && (
          <NavLink href="/reservations" icon="FileText" label="Mes demandes" />
        )}
        {user?.role === 'ADMIN' && (
          <>
            <div className="h-4 w-px bg-slate-700 mx-2" />
            <NavLink href="/admin" icon="ShieldCheck" label="Admin" highlight />
          </>
        )}
      </nav>

      {/* Right: User Menu */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-white leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {user.role === 'ADMIN' ? 'Admin' : 'Utilisateur'}
              </p>
            </div>
            <UserMenu
              name={user.name || 'Utilisateur'}
              role={user.role || 'USER'}
              signOutAction={async () => {
                'use server';
                await signOut();
              }}
            />
          </div>
        ) : (
          <Button asChild size="sm" className="gap-2">
            <Link href="/auth/signin">
              <LogIn className="h-4 w-4" />
              Connexion
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
