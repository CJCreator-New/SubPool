import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface PageErrorProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

/**
 * Contextual error component for per-page error states.
 * Shows a clean error message with optional retry button.
 * Use this instead of falling back to mock data.
 */
export function PageError({ title = 'Something went wrong', message, onRetry }: PageErrorProps) {
    return (
        <Card className="border-red-500/20 bg-red-500/5 max-w-lg mx-auto mt-12">
            <CardContent className="py-8 text-center">
                <span className="text-3xl block mb-4" role="img" aria-label="Error">⚠️</span>
                <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{message}</p>
                {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Inline error banner for less severe errors (e.g. partial data load failure).
 */
export function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="mb-4 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <p className="font-mono text-xs text-amber-500">
                <span role="img" aria-label="Warning">⚠</span> {message}
            </p>
        </div>
    );
}
