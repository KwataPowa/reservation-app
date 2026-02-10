'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const handleLogin = () => {
        const serviceUrl = window.location.origin + '/api/auth/cas/callback';
        window.location.href = `https://cas.unistra.fr/cas/login?service=${encodeURIComponent(serviceUrl)}`;
    };

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#2566AF]">ICUBE Resa</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Connectez-vous pour réserver du matériel
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-700">
                            Erreur d&apos;authentification : {error}
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <button
                        onClick={handleLogin}
                        className="flex w-full justify-center rounded-md bg-[#2566AF] py-2.5 px-4 text-sm font-medium text-white hover:bg-[#1e5294] transition-colors"
                    >
                        Se connecter avec CAS Unistra
                    </button>
                    <p className="mt-4 text-center text-xs text-gray-400">
                        Vous serez redirigé vers le portail CAS de l&apos;Université de Strasbourg
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="text-center py-12 text-gray-400">Chargement...</div>}>
            <SignInContent />
        </Suspense>
    );
}
