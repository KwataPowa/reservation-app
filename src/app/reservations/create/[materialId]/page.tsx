import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ReservationForm from '@/components/ReservationForm';

export default async function CreateReservationPage({
    params,
}: {
    params: Promise<{ materialId: string }>;
}) {
    const { materialId } = await params
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
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                        Nouvelle Réservation
                    </h2>
                    <ReservationForm materialId={material.id} materialName={material.name} />
                </div>
            </div>
        </div>
    );
}
