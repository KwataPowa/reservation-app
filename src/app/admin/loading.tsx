import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
    return (
        <div className="space-y-6">
            {/* Page header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-44" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-9 w-40 rounded-md" />
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-5 flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-7 w-12" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Reservations list header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Reservation cards */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-24 rounded-md" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
