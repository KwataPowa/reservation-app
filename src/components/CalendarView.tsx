'use client';

import { useState } from 'react';
import { Material, Reservation } from '@prisma/client';

interface CalendarProps {
    materials: Material[];
    reservations: (Reservation & { material: Material; user: { name: string | null } })[];
}

export default function CalendarView({ materials, reservations }: CalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ALL');

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    // Generate days for the grid
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    // Adjust for Monday start
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    // Filter reservations
    const getReservationsForDate = (date: Date) => {
        if (!date) return [];
        return reservations.filter(res => {
            const start = new Date(res.startDate);
            const end = new Date(res.endDate);
            // Check overlaps
            // Reset hours for strict date comparison
            const checkDate = new Date(date).setHours(12, 0, 0, 0);
            const rStart = new Date(start).setHours(0, 0, 0, 0);
            const rEnd = new Date(end).setHours(23, 59, 59, 999);

            const match = checkDate >= rStart && checkDate <= rEnd;
            if (!match) return false;

            if (selectedMaterialId !== 'ALL' && res.materialId !== selectedMaterialId) return false;
            return true;
        });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 border border-gray-200 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">&lt;</button>
                    <h2 className="text-lg font-bold uppercase tracking-widest">
                        {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">&gt;</button>
                </div>

                <select
                    value={selectedMaterialId}
                    onChange={e => setSelectedMaterialId(e.target.value)}
                    className="lab-border px-3 py-1.5 text-sm w-full sm:w-auto"
                >
                    <option value="ALL">Tous les équipements</option>
                    {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white border border-gray-200">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['LUN', 'MAR', 'MER JEU', 'VEN', 'SAM', 'DIM'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-bold text-gray-500">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr">
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="h-32 border-b border-r border-gray-100 bg-gray-50/30"></div>;

                        const dayReservations = getReservationsForDate(date);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div key={date.toISOString()} className={`min-h-[8rem] border-b border-r border-gray-100 p-1 relative ${isToday ? 'bg-blue-50/30' : ''}`}>
                                <span className={`absolute top-1 right-2 text-xs font-mono ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                    {date.getDate()}
                                </span>
                                <div className="mt-5 space-y-1">
                                    {dayReservations.slice(0, 3).map(res => (
                                        <div
                                            key={res.id}
                                            className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${res.status === 'APPROVED'
                                                    ? 'bg-green-50 border-green-200 text-green-800'
                                                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                                }`}
                                            title={`${res.material.name} - ${res.user.name}`}
                                        >
                                            {res.material.name}
                                        </div>
                                    ))}
                                    {dayReservations.length > 3 && (
                                        <div className="text-[10px] text-gray-400 text-center font-mono">
                                            + {dayReservations.length - 3} autres
                                        </div>
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
