'use client';

import { useState } from 'react';
import { Material, Reservation } from '@prisma/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

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

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 border border-gray-200 gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 transition-colors border border-gray-200">
                        <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 min-w-[160px] text-center">
                        {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 transition-colors border border-gray-200">
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>
                </div>

                <select
                    value={selectedMaterialId}
                    onChange={e => setSelectedMaterialId(e.target.value)}
                    className="border border-gray-200 px-3 py-1.5 text-sm focus:border-[#2566AF] outline-none w-full sm:w-auto"
                >
                    <option value="ALL">Tous les équipements</option>
                    {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            {/* Grid */}
            <div className="bg-white border border-gray-200">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {DAYS_HEADER.map(day => (
                        <div key={day} className="py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="h-28 border-b border-r border-gray-100 bg-gray-50/30" />;

                        const dayReservations = getReservationsForDate(date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div key={date.toISOString()} className={`min-h-[7rem] border-b border-r border-gray-100 p-1.5 relative ${isToday ? 'bg-blue-50/40' : ''}`}>
                                <span className={`text-xs lab-mono ${isToday ? 'text-[#2566AF] font-bold' : 'text-gray-400'}`}>
                                    {date.getDate()}
                                </span>
                                <div className="mt-1 space-y-0.5">
                                    {dayReservations.slice(0, 3).map(res => (
                                        <div
                                            key={res.id}
                                            className={`text-[10px] px-1.5 py-0.5 truncate border-l-2 ${res.status === 'APPROVED'
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                                    : 'bg-amber-50 border-amber-500 text-amber-800'
                                                }`}
                                            title={`${res.material.name} — ${res.user.name}`}
                                        >
                                            {res.material.name}
                                        </div>
                                    ))}
                                    {dayReservations.length > 3 && (
                                        <div className="text-[10px] text-gray-400 text-center lab-mono">+{dayReservations.length - 3}</div>
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
