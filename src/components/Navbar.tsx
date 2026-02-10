import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Package, CalendarDays, FileText, ShieldCheck, LogOut, LogIn, Menu } from 'lucide-react';

export default async function Navbar() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-gray-800 z-50 flex items-center justify-between px-6 shadow-lg">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2566AF] flex items-center justify-center rounded text-white font-bold text-xs tracking-tighter">
                    IC
                </div>
                <span className="font-bold text-white tracking-tight hidden sm:inline-block">
                    ICUBE <span className="text-[#4A85C5] font-light">RESA</span>
                </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
                <NavLink href="/" icon={<Package size={16} />} label="Matériel" />
                <NavLink href="/calendar" icon={<CalendarDays size={16} />} label="Planning" />
                {user && (
                    <NavLink href="/reservations" icon={<FileText size={16} />} label="Mes demandes" />
                )}
                {user?.role === 'ADMIN' && (
                    <div className="ml-4 pl-4 border-l border-gray-700">
                        <NavLink href="/admin" icon={<ShieldCheck size={16} />} label="Admin" highlight />
                    </div>
                )}
            </nav>

            {/* Mobile / User Menu */}
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 border border-gray-600">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <form action={async () => { 'use server'; await signOut(); }}>
                            <button className="text-gray-400 hover:text-red-400 transition-colors p-2" title="Déconnexion">
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link href="/auth/signin" className="flex items-center gap-2 text-sm font-medium text-white bg-[#2566AF] hover:bg-[#1A4B82] px-4 py-2 rounded transition-colors">
                        <LogIn size={16} />
                        Connexion
                    </Link>
                )}
            </div>
        </header>
    );
}

function NavLink({ href, icon, label, highlight }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${highlight
                    ? 'text-blue-400 hover:bg-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
}
