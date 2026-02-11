import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReservationForm from '@/components/ReservationForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';

export default async function CreateReservationPage({
    params,
}: {
    params: Promise<{ materialId: string }>;
}) {
    const { materialId } = await params;
    const session = await auth();
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const material = await prisma.material.findUnique({
        where: { id: materialId },
    });

    if (!material) {
        redirect('/');
    }

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-4">
                <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Retour au matériel
                </Link>
            </div>
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-5">
                        Nouvelle Réservation
                    </h2>
                    <ReservationForm materialId={material.id} materialName={material.name} />
                </CardContent>
            </Card>
        </div>
    );
}
