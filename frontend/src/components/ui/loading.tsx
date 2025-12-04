import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  text, 
  fullPage = false,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        {/* Modern spinner with glow effect */}
        <div className="relative">
          <Loader2 
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size]
            )} 
          />
          <div className={cn(
            'absolute inset-0 animate-pulse-glow rounded-full bg-primary/20',
            sizeClasses[size]
          )} />
        </div>

        {/* Loading text */}
        {text && (
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            {text}
          </p>
        )}

        {/* Loading dots animation */}
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for content
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton rounded-md', className)} />
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-fade-in">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="border rounded-xl p-6 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

