import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarLoading() {
    return (
        <div className="space-y-6">
            {/* Page header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* Toolbar skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-5 w-[150px]" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-8 w-full sm:w-[220px] rounded-md" />
            </div>

            {/* Calendar grid skeleton */}
            <div className="rounded-lg border bg-card overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b bg-muted/50 py-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex justify-center">
                            <Skeleton className="h-3 w-6" />
                        </div>
                    ))}
                </div>
                {/* Calendar rows */}
                {Array.from({ length: 5 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-7">
                        {Array.from({ length: 7 }).map((_, col) => (
                            <div key={col} className="h-24 sm:h-28 border-b border-r border-border/50 p-1.5">
                                <Skeleton className="h-4 w-4 mb-1" />
                                {row < 3 && col < 4 && <Skeleton className="h-3 w-full mt-1" />}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
