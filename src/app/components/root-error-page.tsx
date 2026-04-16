import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';
import { Button } from './ui/button';
import { logError } from '../../lib/monitoring';

export function RootErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    // Log the error for tracking
    React.useEffect(() => {
        if (error instanceof Error) {
            logError(error, { routeError: true });
            console.error('[Route Error]:', error);
        } else {
            console.error('[Route Error]:', error);
        }
    }, [error]);

    let errorMessage = "An unexpected error occurred.";
    let errorTitle = "Application Error";

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            errorTitle = "404 Not Found";
            errorMessage = "The page you are looking for doesn't exist.";
        } else if (error.status === 401) {
            errorTitle = "401 Unauthorized";
            errorMessage = "You need to be logged in to access this page.";
        } else if (error.status === 503) {
            errorTitle = "503 Service Unavailable";
            errorMessage = "Our services are currently down. Please try again later.";
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#0E0E0E] text-foreground">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative text-7xl mb-4 grayscale opacity-80">🧊</div>
            </div>
            
            <h1 className="font-display font-black text-4xl mb-4 tracking-tight">
                <span className="text-foreground">Sub</span>
                <span className="text-primary">Pool</span>
                <span className="block text-2xl mt-2 font-bold text-destructive/80 italic">{errorTitle}</span>
            </h1>
            
            <div className="max-w-md bg-card border border-border p-6 rounded-xl mb-8 shadow-2xl backdrop-blur-sm">
                <p className="font-mono text-sm text-muted-foreground leading-relaxed break-words">
                    {errorMessage}
                </p>
                {error instanceof Error && error.stack && (
                    <details className="mt-4 text-left">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">View Trace</summary>
                        <pre className="mt-2 text-[10px] overflow-auto max-h-40 p-2 bg-black/40 rounded border border-border/50 text-muted-foreground/50">
                            {error.stack}
                        </pre>
                    </details>
                )}
            </div>

            <div className="flex gap-4">
                <Button 
                    onClick={() => navigate('/browse')}
                    variant="outline"
                    className="font-display font-bold px-8 h-12"
                >
                    Back to Browse
                </Button>
                <Button 
                    onClick={() => window.location.reload()}
                    className="font-display font-bold px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    Reload App
                </Button>
            </div>
            
            <p className="mt-12 text-xs text-muted-foreground font-mono opacity-50">
                If this keeps happening, please contact support with the error details above.
            </p>
        </div>
    );
}
