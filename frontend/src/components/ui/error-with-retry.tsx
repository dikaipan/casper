'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface ErrorWithRetryProps {
  title?: string;
  description: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorWithRetry({
  title = 'Terjadi Kesalahan',
  description,
  onRetry,
  retryLabel = 'Coba Lagi',
  className = '',
}: ErrorWithRetryProps) {
  return (
    <Card className={`border-red-200 dark:border-red-800 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="h-8 w-8" />
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {retryLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

