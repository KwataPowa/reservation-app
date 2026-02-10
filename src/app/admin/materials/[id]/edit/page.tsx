import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import EditMaterialClient from './EditMaterialClient';

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const material = await prisma.material.findUnique({
        where: { id },
    });

    if (!material) {
        notFound();
    }

    // Parse JSON components to array if needed, handled in client usually but we can prepare it
    const components = Array.isArray(material.components)
        ? material.components as { name: string; serialNumber: string }[]
        : [];

    const initialData = {
        name: material.name,
        description: material.description || '',
        category: material.category || 'Autres',
        location: material.location || '',
        serialNumber: material.serialNumber || '',
        budget: material.budget || '',
        imageUrl: material.imageUrl || '',
        status: material.status,
        components: components,
    };

    return <EditMaterialClient id={material.id} initialData={initialData} />;
}
