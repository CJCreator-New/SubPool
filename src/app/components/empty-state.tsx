import { Button } from './ui/button';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    actionLabel,
}: EmptyStateProps) {
    return (
        <div className="py-16 text-center flex flex-col items-center justify-center">
            <p className="text-6xl opacity-50 mb-4">{icon}</p>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
                {title}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                {description}
            </p>
            {action && actionLabel && (
                <Button onClick={action} className="h-10 px-6">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
