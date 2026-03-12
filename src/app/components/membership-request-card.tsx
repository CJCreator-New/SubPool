import React, { useState } from 'react';
import { Button } from './ui/button';
import { getPlatform } from '../../lib/constants';
import type { JoinRequest } from '../../lib/types';

interface MembershipRequestCardProps {
    request: JoinRequest;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string) => Promise<void>;
}

export function MembershipRequestCard({ request, onApprove, onReject }: MembershipRequestCardProps) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleApprove = async () => {
        setIsApproving(true);
        await onApprove(request.id);
        // Do not set false, assume parent unmounts or refetches removing this card
    };

    const handleReject = async () => {
        setIsRejecting(true);
        await onReject(request.id);
        // Do not set false, assume parent unmounts or refetches removing this card
    };

    const platformName = getPlatform(request.pool?.platform || '')?.name || request.pool?.platform;
    const displayName = request.requester?.display_name || request.requester?.username || 'Member';
    const initial = displayName.charAt(0) || '?';

    return (
        <div className="bg-card border border-primary/30 rounded-[6px] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div
                    className="size-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
                    style={{ backgroundColor: request.requester?.avatar_color || '#2A2A2A' }}
                >
                    {initial}
                </div>
                <div>
                    <h4 className="font-display font-bold text-sm text-foreground">
                        {displayName}
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground leading-tight mt-0.5">
                        wants to join <span className="text-secondary">{platformName}</span> · {request.pool?.plan_name}
                    </p>
                    {request.message && (
                        <p className="font-syne text-xs text-muted-foreground mt-1.5 italic bg-secondary/20 p-2 border-l border-primary/50">
                            "{request.message}"
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <Button
                    size="sm"
                    disabled={isApproving || isRejecting}
                    onClick={handleApprove}
                    className="flex-1 md:flex-none h-8 text-[11px] font-display font-bold bg-primary text-primary-foreground hover:scale-[1.02] transition-transform"
                >
                    {isApproving ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isApproving || isRejecting}
                    onClick={handleReject}
                    className="flex-1 md:flex-none h-8 text-[11px] font-display font-bold border-muted-foreground/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                    {isRejecting ? 'Rejecting...' : 'Reject'}
                </Button>
            </div>
        </div>
    );
}
