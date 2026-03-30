import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function GuestEmptyState({ message = 'Sign in to access this feature' }: { message?: string }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex min-h-[60vh] flex-1 items-center justify-center p-6">
            <Card className="w-full max-w-md border-border/50 bg-card/50 text-center backdrop-blur">
                <CardContent className="flex flex-col items-center px-6 pb-10 pt-10">
                    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <span aria-label="Lock" className="text-2xl" role="img">🔒</span>
                    </div>
                    <h2 className="mb-2 font-display text-xl font-bold text-foreground">
                        Guest Mode
                    </h2>
                    <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                        {message}
                    </p>
                    <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            className="font-display font-semibold"
                            onClick={() => {
                                const next = `${location.pathname}${location.search}${location.hash}`;
                                navigate(`/login?next=${encodeURIComponent(next)}`);
                            }}
                        >
                            Sign In / Sign Up
                        </Button>
                        <Button
                            variant="outline"
                            className="font-display font-semibold"
                            onClick={() => navigate('/browse')}
                        >
                            Browse Open Pools
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
