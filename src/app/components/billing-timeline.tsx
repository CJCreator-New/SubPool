// ─── BillingTimeline ──────────────────────────────────────────────────────────
// Vertical timeline of payment records with status badges and connecting lines.

import { formatDate } from '../../lib/constants';
import type { PaymentRecord } from '../../lib/types';

interface BillingTimelineProps {
    payments: PaymentRecord[];
    className?: string;
}

const STATUS_CONFIG = {
    paid: { label: 'Paid', icon: '✓', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    owed: { label: 'Owed', icon: '⏳', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    overdue: { label: 'Overdue', icon: '⚠', bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', dot: 'bg-red-500' },
    pending: { label: 'Pending', icon: '·', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' },
} as const;

export function BillingTimeline({ payments, className = '' }: BillingTimelineProps) {
    if (payments.length === 0) {
        return (
            <div className={`font-mono text-xs text-muted-foreground py-4 text-center ${className}`}>
                No payment history yet
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {payments.map((payment, idx) => {
                const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                const isLast = idx === payments.length - 1;

                return (
                    <div key={payment.id} className="flex gap-4 relative">
                        {/* Timeline spine */}
                        <div className="flex flex-col items-center">
                            <div className={`size-2.5 rounded-full ${config.dot} z-10 mt-1.5 shrink-0 ring-2 ring-card`} />
                            {!isLast && (
                                <div className="w-px flex-1 bg-border min-h-[24px]" />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                        {formatDate(payment.due_at)}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
                                        {config.icon} {config.label}
                                    </span>
                                </div>
                                <span className={`font-mono text-sm font-bold ${payment.status === 'paid' ? 'text-foreground' :
                                        payment.status === 'overdue' ? 'text-red-500' :
                                            'text-amber-500'
                                    }`}>
                                    ${(payment.amount_cents / 100).toFixed(2)}
                                </span>
                            </div>
                            {payment.settled_at && (
                                <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
                                    Settled {formatDate(payment.settled_at)}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
