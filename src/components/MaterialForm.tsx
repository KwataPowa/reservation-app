'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Box, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MATERIAL_CATEGORIES } from '@/lib/constants';

export interface MaterialFormData {
    name: string;
    description: string;
    serialNumber: string;
    location: string;
    category: string;
    status: string;
    budget: string;
    imageUrl: string;
    components: { name: string; serialNumber: string }[];
}

interface MaterialFormProps {
    initialData?: MaterialFormData;
    onSubmit: (data: MaterialFormData) => Promise<void>;
    isEditing?: boolean;
}

export default function MaterialForm({ initialData, onSubmit, isEditing = false }: MaterialFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState<MaterialFormData>(initialData || {
        name: '',
        description: '',
        serialNumber: '',
        location: 'C120',
        category: 'Casques',
        status: 'AVAILABLE',
        budget: '',
        imageUrl: '',
        components: [],
    });

    const addComponent = () => {
        setForm({
            ...form,
            components: [...form.components, { name: '', serialNumber: '' }]
        });
    };

    const removeComponent = (index: number) => {
        const newComponents = [...form.components];
        newComponents.splice(index, 1);
        setForm({ ...form, components: newComponents });
    };

    const updateComponent = (index: number, field: 'name' | 'serialNumber', value: string) => {
        const newComponents = [...form.components];
        newComponents[index][field] = value;
        setForm({ ...form, components: newComponents });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit(form);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-0">
                <div className="px-6 py-5 border-b">
                    <h2 className="text-lg font-bold text-foreground">
                        {isEditing ? 'Modifier le matériel' : 'Ajouter un matériel'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isEditing ? 'Mettez à jour les informations.' : 'Remplissez les informations techniques et l\'inventaire des composants.'}
                    </p>
                </div>

                <div className="px-6 py-5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Information Générale */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b pb-2">Informations Générales</h3>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom *</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: HTC Vive Pro Eye"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="serialNumber">N° de série (Principal)</Label>
                                    <Input
                                        type="text"
                                        id="serialNumber"
                                        value={form.serialNumber}
                                        onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget / Financement</Label>
                                    <Input
                                        type="text"
                                        id="budget"
                                        value={form.budget}
                                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                                        placeholder="Ex: IdEx Flavien 2022"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">URL Image</Label>
                                <div className="relative">
                                    <ImageIcon size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                    <Input
                                        type="url"
                                        id="imageUrl"
                                        value={form.imageUrl}
                                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                        className="pl-9"
                                        placeholder="https://..."
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Lien direct vers une image du matériel.</p>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider border-b pb-2">Classification & Statut</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Emplacement</Label>
                                    <Input
                                        type="text"
                                        id="location"
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MATERIAL_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Statut Initial</Label>
                                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Disponible</SelectItem>
                                            <SelectItem value="MAINTENANCE">En maintenance</SelectItem>
                                            <SelectItem value="UNAVAILABLE">Indisponible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Composants / Sous-équipements */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Box size={16} /> Composants du Kit
                                </h3>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={addComponent}
                                    className="gap-1 text-xs"
                                >
                                    <Plus size={14} /> Ajouter un composant
                                </Button>
                            </div>

                            {form.components.length === 0 ? (
                                <div className="text-center py-6 bg-muted/50 border border-dashed rounded-lg text-muted-foreground text-sm">
                                    Aucun composant ajouté (ex: manettes, câbles, stations...).
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.components.map((comp, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg border">
                                            <span className="text-xs font-bold text-muted-foreground mt-2.5">#{idx + 1}</span>
                                            <div className="flex-grow grid grid-cols-2 gap-3">
                                                <Input
                                                    type="text"
                                                    placeholder="Nom (ex: Manette Droite)"
                                                    value={comp.name}
                                                    onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                                    className="text-xs h-8"
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="N° de série"
                                                    value={comp.serialNumber}
                                                    onChange={(e) => updateComponent(idx, 'serialNumber', e.target.value)}
                                                    className="text-xs h-8 font-mono"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeComponent(idx)}
                                                aria-label="Supprimer le composant"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer le matériel')}
                            </Button>
                        </div>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
