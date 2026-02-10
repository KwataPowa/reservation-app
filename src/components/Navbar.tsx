import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Navbar() {
    const session = await auth();
    const user = session?.user;

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    {/* Logo + Nav links */}
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-xl font-bold text-[#2566AF]">
                            ICUBE Resa
                        </Link>
                        <div className="hidden sm:flex sm:space-x-6">
                            <Link
                                href="/"
                                className="text-sm font-medium text-gray-600 hover:text-[#2566AF] transition-colors"
                            >
                                Matériel
                            </Link>
                            {user && (
                                <Link
                                    href="/reservations"
                                    className="text-sm font-medium text-gray-600 hover:text-[#2566AF] transition-colors"
                                >
                                    Mes Réservations
                                </Link>
                            )}
                            {user?.role === 'ADMIN' && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium text-gray-600 hover:text-[#2566AF] transition-colors"
                                >
                                    Administration
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Auth */}
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">{user.name}</span>
                                <form
                                    action={async () => {
                                        'use server';
                                        await signOut();
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Déconnexion
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="rounded-md bg-[#2566AF] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e5294] transition-colors"
                            >
                                Connexion
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
