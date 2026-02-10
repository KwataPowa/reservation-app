'use client';

import { useRouter } from 'next/navigation';
import MaterialForm, { MaterialFormData } from '@/components/MaterialForm';

export default function EditMaterialClient({ id, initialData }: { id: string, initialData: MaterialFormData }) {
    const router = useRouter();

    const handleSubmit = async (data: MaterialFormData) => {
        const res = await fetch(`/api/materials/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        router.refresh();
        router.push('/admin');
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-4">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-[#2566AF] hover:text-[#1e5294] transition-colors"
                >
                    ← Retour
                </button>
            </div>
            <MaterialForm initialData={initialData} onSubmit={handleSubmit} isEditing />
        </div>
    );
}
