import { useActionSummary } from '../../lib/hooks/useActionSummary';
import { StatCard, NumberTicker } from '../components/subpool-components';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, CreditCard, Bell, ArrowRight } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function ActionCenter() {
    const navigate = useNavigate();
    const { 
        pendingRequests, 
        duePayments, 
        unreadNotifications, 
        monthlySavingsCents,
        loading 
    } = useActionSummary();

    const hasActions = pendingRequests.length > 0 || duePayments.length > 0;

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-8 animate-pulse">
                <div className="h-32 w-full bg-white/5 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 noise-overlay min-h-screen">
            {/* Header: Greeting & Savings */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b border-white/5">
                <div>
                    <h1 className="font-display font-black text-4xl tracking-tight text-foreground">Action Center</h1>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em] mt-2">
                        {hasActions ? 'Tasks requiring your attention' : 'All systems clear'}
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Monthly Savings</p>
                        <div className="text-2xl font-display font-black text-primary">
                            $<NumberTicker value={monthlySavingsCents / 100} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Primary Actions Column */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* HOST: Pending Requests */}
                    <AnimatePresence mode="popLayout">
                        {pendingRequests.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                    <h2 className="font-display font-bold text-lg">Join Requests</h2>
                                    <span className="text-xs font-mono text-muted-foreground ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                                        {pendingRequests.length} pending
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    {pendingRequests.map((req) => (
                                        <Card key={req.id} className="border-white/5 bg-transparent glass-premium overflow-hidden transition-all hover:border-primary/20">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <Avatar className="size-10 border border-primary/20">
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {req.requester?.username?.[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-display font-bold text-sm truncate">
                                                        {req.requester?.username} <span className="text-muted-foreground font-normal">wants to join</span> {req.pool?.plan_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 italic truncate">
                                                        "{req.message || 'No message provided'}"
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="ghost" className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                                                        <X size={16} />
                                                    </Button>
                                                    <Button size="icon" className="size-8 rounded-full shadow-glow-primary">
                                                        <Check size={16} />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* MEMBER: Due Payments */}
                    <AnimatePresence mode="popLayout">
                        {duePayments.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                                    <h2 className="font-display font-bold text-lg">Upcoming Payments</h2>
                                    <span className="text-xs font-mono text-muted-foreground ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                                        {duePayments.length} outstanding
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {duePayments.map((payment) => (
                                        <Card key={payment.id} className="border-white/5 bg-transparent glass-premium transition-all hover:border-blue-500/20">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <CreditCard size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-display font-bold text-sm">{payment.pool_name}</p>
                                                        <p className="font-mono text-[10px] text-muted-foreground uppercase mt-0.5">
                                                            Due {formatDistanceToNow(new Date(payment.due_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-6">
                                                    <div className="text-lg font-display font-bold text-foreground">
                                                        ${(payment.amount_cents / 100).toFixed(2)}
                                                    </div>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/20">
                                                        Pay Now
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    {/* Empty State */}
                    {!hasActions && (
                        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/5 rounded-3xl opacity-50 space-y-4">
                            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-primary">
                                <Check size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-display font-bold text-xl uppercase tracking-tighter">You're all caught up</h3>
                                <p className="text-sm font-mono mt-1">No pending actions found for your memberships.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate('/browse')} className="rounded-full">
                                Browse New Pools
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar: Activity & Notifications */}
                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-muted-foreground" />
                            <h2 className="font-display font-bold text-lg">Activity</h2>
                        </div>
                        
                        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                            {unreadNotifications.length > 0 ? (
                                unreadNotifications.map((notif) => (
                                    <div key={notif.id} className="p-4 hover:bg-white/5 transition-colors group">
                                        <p className="text-xs font-bold text-foreground leading-snug">{notif.title}</p>
                                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{notif.body}</p>
                                        <p className="text-[9px] font-mono text-muted-foreground/50 mt-2 uppercase">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-muted-foreground">
                                    <p className="font-mono text-[10px] uppercase tracking-widest">No notifications</p>
                                </div>
                            )}
                        </div>
                        
                        <Button variant="ghost" className="w-full text-xs font-mono text-muted-foreground hover:text-primary transition-colors group">
                           View All Activity <ArrowRight size={12} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </section>

                    {/* Quick Referral/Pro Card */}
                    <Card className="bg-primary shadow-glow-primary border-none overflow-hidden group">
                        <CardContent className="p-6 relative">
                            <div className="relative z-10 space-y-4">
                                <h3 className="font-display font-black text-2xl text-primary-foreground tracking-tighter leading-none">
                                    INVITE & <br />SAVE MORE
                                </h3>
                                <p className="text-primary-foreground/80 font-mono text-[10px] uppercase tracking-widest">
                                    Get Pro free for 1 month by inviting 3 friends.
                                </p>
                                <Button className="w-full bg-primary-foreground text-primary font-bold hover:bg-white rounded-full">
                                    Share Referral Link
                                </Button>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -right-8 -bottom-8 size-32 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
