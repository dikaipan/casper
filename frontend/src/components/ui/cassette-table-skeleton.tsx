import { Skeleton } from './loading';

export function CassetteTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50 dark:bg-slate-800/50">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-gray-50/30 dark:hover:bg-slate-700/30 transition-colors"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

