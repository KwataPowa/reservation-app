'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import MaterialForm, { MaterialFormData } from '@/components/MaterialForm';
import { Button } from '@/components/ui/button';

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
        router.push('/');
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-muted-foreground"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Retour
                </Button>
            </div>
            <MaterialForm initialData={initialData} onSubmit={handleSubmit} isEditing />
        </div>
    );
}
