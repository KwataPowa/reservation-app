import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Navbar() {
    const session = await auth();
    const user = session?.user;

    return (
        <aside className="fixed top-0 left-0 h-full w-16 hover:w-64 bg-[#0F172A] text-white transition-all duration-300 z-50 overflow-hidden flex flex-col shadow-2xl group">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center border-b border-gray-800 bg-[#0F172A]">
                <div className="font-bold text-xl tracking-tighter text-[#3b82c4]">IC</div>
                <span className="hidden group-hover:block ml-2 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ICUBE RESA
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 flex flex-col gap-1">
                <NavItem href="/" icon="📦" label="Matériel" />
                <NavItem href="/calendar" icon="📅" label="Planning" />

                {user && (
                    <>
                        <div className="my-4 border-t border-gray-800/50 mx-4"></div>
                        <NavItem href="/reservations" icon="📑" label="Mes Demandes" />
                    </>
                )}

                {user?.role === 'ADMIN' && (
                    <NavItem href="/admin" icon="🛡️" label="Administration" highlight />
                )}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#0B1120]">
                {user ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="hidden group-hover:block whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-sm font-bold truncate max-w-[120px]">{user.name}</p>
                                <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.email}</p>
                            </div>
                        </div>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <button className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors p-1">
                                <span className="w-8 text-center text-lg">⏻</span>
                                <span className="hidden group-hover:block text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Déconnexion</span>
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link href="/auth/signin" className="flex items-center gap-3 text-blue-400 hover:text-blue-300">
                        <span className="w-8 text-center text-lg">➔</span>
                        <span className="hidden group-hover:block text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Connexion</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, highlight }: { href: string; icon: string; label: string; highlight?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-4 py-3 transition-colors relative hover:bg-gray-800 ${highlight ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
        >
            <span className="text-xl w-8 text-center shrink-0">{icon}</span>
            <span className="hidden group-hover:block whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
            </span>
            {highlight && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
            )}
        </Link>
    );
}
