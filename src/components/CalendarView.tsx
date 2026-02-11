'use client';

import { useState, useMemo } from 'react';
import { Material, Reservation } from '@prisma/client';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDateShort } from '@/lib/constants';

interface CalendarProps {
    materials: Material[];
    reservations: (Reservation & { material: Material; user: { name: string | null } })[];
}

const DAYS_HEADER = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function CalendarView({ materials, reservations }: CalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ALL');

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days: (Date | null)[] = useMemo(() => {
        const result: (Date | null)[] = [];
        for (let i = 0; i < startOffset; i++) result.push(null);
        for (let i = 1; i <= daysInMonth; i++) result.push(new Date(year, month, i));
        return result;
    }, [year, month, daysInMonth, startOffset]);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const getReservationsForDate = (date: Date) => {
        return reservations.filter(res => {
            const checkDate = new Date(date).setHours(12, 0, 0, 0);
            const rStart = new Date(res.startDate).setHours(0, 0, 0, 0);
            const rEnd = new Date(res.endDate).setHours(23, 59, 59, 999);
            if (checkDate < rStart || checkDate > rEnd) return false;
            if (selectedMaterialId !== 'ALL' && res.materialId !== selectedMaterialId) return false;
            return true;
        });
    };

    const monthLabel = viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        aria-label="Mois précédent"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <h2 className="text-sm font-semibold capitalize min-w-[150px] text-center text-foreground">
                        {monthLabel}
                    </h2>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        aria-label="Mois suivant"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {!isCurrentMonth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => setViewDate(new Date())}
                        >
                            <CalendarDays className="h-3.5 w-3.5" />
                            Aujourd&apos;hui
                        </Button>
                    )}
                </div>

                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                    <SelectTrigger className="w-full sm:w-[220px]" size="sm">
                        <SelectValue placeholder="Filtrer par équipement" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous les équipements</SelectItem>
                        {materials.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Grid */}
            <div className="rounded-lg border bg-card overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b bg-muted/50">
                    {DAYS_HEADER.map(day => (
                        <div key={day} className="py-2 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7">
                    {days.map((date, idx) => {
                        if (!date) {
                            return (
                                <div
                                    key={`empty-${idx}`}
                                    className="h-24 sm:h-28 border-b border-r border-border/50 bg-muted/20"
                                />
                            );
                        }

                        const dayReservations = getReservationsForDate(date);
                        const isToday = today.toDateString() === date.toDateString();

                        return (
                            <div
                                key={date.toISOString()}
                                className={`h-24 sm:h-28 border-b border-r border-border/50 p-1 sm:p-1.5 relative ${
                                    isToday ? 'bg-primary/5' : ''
                                }`}
                            >
                                <span
                                    className={`text-xs lab-mono inline-flex items-center justify-center ${
                                        isToday
                                            ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 text-[10px] font-bold'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {date.getDate()}
                                </span>

                                <div className="mt-0.5 space-y-0.5 overflow-hidden">
                                    {dayReservations.slice(0, 2).map(res => (
                                        <Tooltip key={res.id}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`text-[10px] px-1 sm:px-1.5 py-0.5 rounded truncate cursor-default border-l-2 ${
                                                        res.status === 'APPROVED'
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                            : 'bg-amber-50 border-amber-500 text-amber-700'
                                                    }`}
                                                >
                                                    <span className="hidden sm:inline">{res.material.name}</span>
                                                    <span className="sm:hidden">{res.material.name.substring(0, 8)}</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[220px]">
                                                <p className="font-medium">{res.material.name}</p>
                                                <p className="text-muted-foreground mt-0.5">
                                                    {res.user.name || 'Utilisateur'} &middot; {formatDateShort(res.startDate)} → {formatDateShort(res.endDate)}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                    {dayReservations.length > 2 && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-[10px] text-muted-foreground text-center lab-mono cursor-default">
                                                    +{dayReservations.length - 2}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom">
                                                <div className="space-y-1">
                                                    {dayReservations.slice(2).map(res => (
                                                        <p key={res.id} className="text-xs">
                                                            {res.material.name} — {res.user.name}
                                                        </p>
                                                    ))}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
