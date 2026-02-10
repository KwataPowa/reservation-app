import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { Package, CalendarDays, FileText, ShieldCheck, LogOut, LogIn } from 'lucide-react';

export default async function Navbar() {
    const session = await auth();
    const user = session?.user;

    return (
        <aside className="fixed top-0 left-0 h-full w-16 hover:w-56 bg-[#0F172A] text-white transition-all duration-300 z-50 overflow-hidden flex flex-col shadow-2xl group">
            {/* Logo */}
            <div className="h-14 flex items-center px-4 border-b border-white/10">
                <span className="font-bold text-lg tracking-tighter text-[#4A85C5] shrink-0 w-8 text-center">IC</span>
                <span className="ml-3 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ICUBE RESA
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 flex flex-col gap-0.5">
                <NavItem href="/" icon={<Package size={18} />} label="Matériel" />
                <NavItem href="/calendar" icon={<CalendarDays size={18} />} label="Planning" />
                {user && (
                    <>
                        <div className="my-3 border-t border-white/5 mx-4" />
                        <NavItem href="/reservations" icon={<FileText size={18} />} label="Mes demandes" />
                    </>
                )}
                {user?.role === 'ADMIN' && (
                    <NavItem href="/admin" icon={<ShieldCheck size={18} />} label="Administration" />
                )}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-white/10">
                {user ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 text-[#4A85C5]">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <form action={async () => { 'use server'; await signOut(); }}>
                            <button className="w-full flex items-center gap-3 text-gray-500 hover:text-red-400 transition-colors py-1.5">
                                <LogOut size={16} className="shrink-0 ml-1" />
                                <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Déconnexion</span>
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link href="/auth/signin" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors py-1.5">
                        <LogIn size={16} className="shrink-0 ml-1" />
                        <span className="text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Connexion</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
            <span className="shrink-0 w-8 flex justify-center">{icon}</span>
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
            </span>
        </Link>
    );
}
