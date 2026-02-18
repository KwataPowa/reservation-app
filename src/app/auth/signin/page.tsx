'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function SignInContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const handleLogin = () => {
        const serviceUrl = window.location.origin + '/api/auth/cas/callback';
        window.location.href = `https://cas.unistra.fr/cas/login?service=${encodeURIComponent(serviceUrl)}`;
    };

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <img src="/igg-icon.png" alt="IGG" width={48} height={48} className="w-12 h-12 rounded-xl object-contain mb-4 mx-auto" />
                    <h1 className="text-2xl font-bold text-foreground">IGG Resa</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Réservation de matériel scientifique
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">
                            Erreur d&apos;authentification : {error}
                        </p>
                    </div>
                )}

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <Button
                            onClick={handleLogin}
                            className="w-full gap-2"
                            size="lg"
                        >
                            <LogIn className="h-4 w-4" />
                            Se connecter avec Ernest
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            Vous serez redirigé vers le portail CAS de l&apos;Université de Strasbourg
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[70vh] items-center justify-center">
                <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
        }>
            <SignInContent />
        </Suspense>
    );
}
