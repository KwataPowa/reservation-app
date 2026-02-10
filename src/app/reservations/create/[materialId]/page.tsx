import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReservationForm from '@/components/ReservationForm';
import Link from 'next/link';

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
                <Link href="/" className="text-sm text-[#2566AF] hover:text-[#1e5294] transition-colors">
                    ← Retour au matériel
                </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Nouvelle Réservation
                    </h2>
                    <ReservationForm materialId={material.id} materialName={material.name} />
                </div>
            </div>
        </div>
    );
}
