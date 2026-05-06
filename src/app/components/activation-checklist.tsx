import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { track } from '../../lib/analytics';
import { useAuth } from '../../lib/supabase/auth';
import { useMemberships, useNotifications, useReferralStats } from '../../lib/supabase/hooks';
import { cn } from './ui/utils';

type ChecklistStepId = 'profile_completed' | 'first_join_request' | 'notification_interaction' | 'invite_friends';

const STEP_LABELS: Record<ChecklistStepId, string> = {
  profile_completed: 'Complete your profile',
  first_join_request: 'Send your first join request',
  notification_interaction: 'Review your notifications',
  invite_friends: 'Invite your first friend',
};

const STEP_ACTIONS: Record<ChecklistStepId, { label: string; path: string }> = {
  profile_completed: { label: 'Go to Profile', path: '/profile' },
  first_join_request: { label: 'Browse Pools', path: '/browse' },
  notification_interaction: { label: 'Open Notifications', path: '/notifications' },
  invite_friends: { label: 'Invite Friends', path: '/referrals' },
};

export function ActivationChecklist() {
  const { user, profile } = useAuth();
  const { data: memberships } = useMemberships({ allowDemoFallback: true });
  const { data: notifications } = useNotifications({ allowDemoFallback: true });
  const { stats: referralStats } = useReferralStats();

  const steps = useMemo(() => (Object.keys(STEP_LABELS) as ChecklistStepId[]), []);
  const completed = useMemo<Record<ChecklistStepId, boolean>>(() => ({
    profile_completed: Boolean(profile?.display_name?.trim() || profile?.bio?.trim() || (profile?.username && profile.username !== 'yourusername')),
    first_join_request: memberships.some((membership) => membership.status === 'pending' || membership.status === 'active'),
    notification_interaction: notifications.some((notification) => notification.read),
    invite_friends: referralStats.count > 0,
  }), [memberships, notifications, profile?.bio, profile?.display_name, profile?.username, referralStats.count]);

  const previousCompleted = useRef<Record<ChecklistStepId, boolean> | null>(null);
  useEffect(() => {
    if (!previousCompleted.current) {
      previousCompleted.current = completed;
      return;
    }

    for (const step of steps) {
      if (!previousCompleted.current[step] && completed[step]) {
        track('activation_step_completed', { step, source: 'auto' });
      }
    }

    previousCompleted.current = completed;
  }, [completed, steps]);

  const remaining = steps.filter((step) => !completed[step]).length;

  if (!user || remaining === 0) return null;

  return (
    <section className="rounded-2xl border border-white/5 bg-transparent glass-premium p-6 shadow-premium">
      <div className="mb-5">
        <p className="font-display text-lg font-black text-foreground tracking-tight">Getting Started</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          {4 - remaining}/4 tasks completed
        </p>
      </div>
      <ul className="space-y-2.5">
        {steps.map((step) => {
          const isDone = completed[step];
          return (
            <li 
              key={step} 
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300",
                isDone 
                  ? "bg-primary/5 border border-primary/10 opacity-60" 
                  : "bg-white/5 border border-white/5 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  isDone ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                )}>
                  {isDone && <span className="text-[10px] font-black">✓</span>}
                </div>
                <span className={cn(
                    "font-display text-sm",
                    isDone ? "text-muted-foreground line-through" : "text-foreground font-semibold"
                )}>
                  {STEP_LABELS[step]}
                </span>
              </div>
              {!isDone && (
                <Link
                  to={STEP_ACTIONS[step].path}
                  className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary font-black hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {STEP_ACTIONS[step].label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
