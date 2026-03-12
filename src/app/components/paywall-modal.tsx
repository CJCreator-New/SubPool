import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { track } from '../../lib/analytics';

interface PaywallModalProps {
    feature: string;
    requiredPlan: 'pro' | 'host_plus';
    open: boolean;
    onClose: () => void;
}

export function PaywallModal({ feature, requiredPlan, open, onClose }: PaywallModalProps) {
    const navigate = useNavigate();

    const featureContext: Record<string, { blockedAction: string; outcomes: string[] }> = {
        'Market Intelligence': {
            blockedAction: 'View live market rates',
            outcomes: [
                'See pricing benchmarks before publishing pools.',
                'Spot demand shifts across top platforms.',
                'List with better conversion confidence.',
            ],
        },
        'hosting more pools': {
            blockedAction: 'Host additional pools',
            outcomes: [
                'Publish multiple pools simultaneously.',
                'Increase member capacity with host controls.',
                'Scale recurring savings faster.',
            ],
        },
    };

    const context = featureContext[feature] ?? {
        blockedAction: feature,
        outcomes: [
            `Unlock ${feature} for your account.`,
            'Get premium controls and automation.',
            'Improve conversion with advanced host tools.',
        ],
    };

    const planInfo = {
        pro: {
            name: 'Pro',
            price: '$4.99/mo',
            features: ['Host up to 5 pools', 'Unlimited memberships', 'Bulk reminders']
        },
        host_plus: {
            name: 'Host Plus',
            price: '$9.99/mo',
            features: ['Unlimited hosting', 'Priority listing', 'Market analytics']
        }
    }[requiredPlan];

    React.useEffect(() => {
        if (open) {
            track('paywall_shown', { feature, requiredPlan });
        }
    }, [open, feature, requiredPlan]);

    const handleUpgrade = () => {
        track('paywall_upgrade_clicked', { feature, targetPlan: requiredPlan });
        onClose();
        navigate('/plans', {
            state: {
                source: 'paywall',
                feature,
                requiredPlan,
                blockedAction: context.blockedAction,
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                track('paywall_dismissed', { feature });
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border bg-card">
                <div className="p-8 text-center">
                    <div className="text-4xl mb-6">🔒</div>

                    <DialogHeader className="mb-6">
                        <DialogTitle className="font-display font-black text-2xl text-center">
                            Unlock {feature}
                        </DialogTitle>
                        <DialogDescription className="font-mono text-[12px] text-muted-foreground text-center mt-2">
                            You've reached the limit on the Free plan. Upgrade to {planInfo.name} to continue scaling your savings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-display font-bold text-lg text-primary">{planInfo.name} Plan</span>
                            <span className="font-mono text-sm font-bold text-primary">{planInfo.price}</span>
                        </div>
                        <ul className="space-y-2.5">
                            {planInfo.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2.5 font-display text-xs text-foreground">
                                    <span className="size-4 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[8px] font-bold" role="img" aria-label="Check">✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleUpgrade}
                            className="w-full h-12 font-display font-bold text-sm shadow-lg shadow-primary/10"
                        >
                            Upgrade to {planInfo.name} — {planInfo.price}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                track('paywall_dismissed', { feature });
                                onClose();
                            }}
                            className="w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground h-10"
                        >
                            Not now, thanks
                        </Button>
                    </div>

                    <p className="mt-6 font-mono text-[10px] text-muted-foreground">
                        7-day free trial · Cancel anytime · No questions asked
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
