import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { track } from '../../lib/analytics';
import { useAuth } from '../../lib/supabase/auth';
import { useMemberships, useNotifications, useReferralStats } from '../../lib/supabase/hooks';

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
    profile_completed: Boolean(profile?.display_name?.trim() || profile?.bio?.trim()),
    first_join_request: memberships.some((membership) => membership.status === 'pending' || membership.status === 'active'),
    notification_interaction: notifications.some((notification) => notification.read),
    invite_friends: referralStats.count > 0,
  }), [memberships, notifications, profile?.bio, profile?.display_name, referralStats.count]);

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
    <section className="rounded-[8px] border border-border bg-card p-4">
      <div className="mb-3">
        <p className="font-display text-base font-bold text-foreground">Getting Started Checklist</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          Complete these to unlock the full SubPool experience.
        </p>
      </div>
      <ul className="space-y-2">
        {steps.map((step) => (
          <li key={step} className="flex items-center justify-between rounded-[6px] border border-border px-3 py-2">
            <span className="font-display text-sm text-foreground">{STEP_LABELS[step]}</span>
            {completed[step] ? (
              <span className="font-mono text-[11px] text-success">Done</span>
            ) : (
              <Link
                to={STEP_ACTIONS[step].path}
                className="rounded-[4px] border border-primary/40 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-primary hover:bg-primary/10"
              >
                {STEP_ACTIONS[step].label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
