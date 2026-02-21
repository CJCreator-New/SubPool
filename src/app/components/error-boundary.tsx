import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-card border border-destructive/20 rounded-[6px] space-y-4">
                    <div className="text-4xl">⚠️</div>
                    <h2 className="font-display font-bold text-xl text-foreground">Something went wrong</h2>
                    <p className="font-mono text-sm text-muted-foreground max-w-xs mx-auto">
                        We encountered an unexpected error while rendering this page.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="font-display font-bold"
                    >
                        Reload page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
