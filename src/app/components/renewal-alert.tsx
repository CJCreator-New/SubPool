// ─── RenewalAlert ─────────────────────────────────────────────────────────────
// Banner that shows when subscriptions need attention (renewing soon, overdue,
// or expiring). Displayed at top of the subscriptions page.

import type { SubscriptionDetail } from '../../lib/types';

interface RenewalAlertProps {
    alerts: SubscriptionDetail[];
    className?: string;
}

export function RenewalAlert({ alerts, className = '' }: RenewalAlertProps) {
    if (alerts.length === 0) return null;

    const overdueAlerts = alerts.filter((a) => a.renewalStatus === 'overdue');
    const expiringAlerts = alerts.filter((a) => a.renewalStatus === 'expiring');
    const renewingSoonAlerts = alerts.filter((a) => a.renewalStatus === 'renewing_soon');

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Overdue / Expiring — RED */}
            {(overdueAlerts.length > 0 || expiringAlerts.length > 0) && (
                <div className="flex items-start gap-3 px-5 py-4 border border-red-500/20 bg-red-500/5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="size-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        {overdueAlerts.length > 0
                            ? <span className="text-sm" role="img" aria-label="Error">❌</span>
                            : <span className="text-sm" role="img" aria-label="Warning">⚠️</span>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-red-400">
                            {overdueAlerts.length > 0
                                ? `${overdueAlerts.length} overdue payment${overdueAlerts.length > 1 ? 's' : ''}`
                                : `${expiringAlerts.length} subscription${expiringAlerts.length > 1 ? 's' : ''} expiring soon`
                            }
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {[...overdueAlerts, ...expiringAlerts].map((alert) => (
                                <span
                                    key={alert.membership.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 font-mono text-[10px] text-red-400"
                                >
                                    <span>{alert.platform.icon}</span>
                                    <span className="font-bold">{alert.platform.name}</span>
                                    <span className="text-red-500/60">
                                        {alert.renewalStatus === 'overdue'
                                            ? `${Math.abs(alert.daysUntilRenewal ?? 0)}d overdue`
                                            : `${alert.daysUntilRenewal}d left`
                                        }
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Renewing Soon — AMBER */}
            {renewingSoonAlerts.length > 0 && (
                <div className="flex items-start gap-3 px-5 py-4 border border-amber-500/20 bg-amber-500/5 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="size-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sm" role="img" aria-label="icon">🕐</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-amber-400">
                            {renewingSoonAlerts.length} subscription{renewingSoonAlerts.length > 1 ? 's' : ''} renewing soon
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {renewingSoonAlerts.map((alert) => (
                                <span
                                    key={alert.membership.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-400"
                                >
                                    <span>{alert.platform.icon}</span>
                                    <span className="font-bold">{alert.platform.name}</span>
                                    <span className="text-amber-500/60">in {alert.daysUntilRenewal}d</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
