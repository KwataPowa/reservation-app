'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInGeneric() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const handleLogin = () => {
        // Redirect to CAS login
        // The service URL must match what is configured in .env and expected by the callback
        // We can fetch it or hardcode relative path if we know the domain
        // Ideally we redirect to the API route that handles the initiation, or construct URL here.
        // For now, let's construct it manually or fetch from an endpoint.
        // Since we are client side, we don't have process.env.CAS_SERVICE_URL directly unless NEXT_PUBLIC.
        // Let's assume the user knows they need to click it.

        // Better: Redirect to an API route that redirects to CAS, to keep secrets server-side.
        // But for simplicity, we can do it here if we expose the service URL.

        // Actually, the callback URL is http://localhost:3000/api/auth/cas/callback (or production equivalent)
        // The service parameter sent to CAS must matches this.

        const serviceUrl = window.location.origin + '/api/auth/cas/callback';
        window.location.href = `https://cas.unistra.fr/cas/login?service=${encodeURIComponent(serviceUrl)}`;
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign inside
                </h2>
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Authentication Error: {error}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                    <button
                        onClick={handleLogin}
                        className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Sign in with CAS Unistra
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInGeneric />
        </Suspense>
    )
}
