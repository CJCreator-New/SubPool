import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Check, Sparkles, Wallet, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../components/ui/utils';

type OnboardingRole = 'host' | 'joiner';

const roleCopy = {
  joiner: {
    title: 'Join smarter',
    subtitle: 'Find trusted hosts, compare savings, and join faster.',
    path: '/browse',
    icon: Users,
    checklist: [
      'Browse open pools with pricing context',
      'Track renewals and payment history',
      'Get notified when matching slots appear',
    ],
  },
  host: {
    title: 'Host with control',
    subtitle: 'List your pool, review requests, and track earnings.',
    path: '/list',
    icon: Wallet,
    checklist: [
      'Publish a pool with trust and pricing signals',
      'Approve members and manage chat securely',
      'Monitor earnings and payout status',
    ],
  },
} satisfies Record<OnboardingRole, {
  title: string;
  subtitle: string;
  path: string;
  icon: typeof Users;
  checklist: string[];
}>;

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<OnboardingRole>('joiner');

  const activeRole = useMemo(() => roleCopy[role], [role]);
  const ActiveIcon = activeRole.icon;

  const handleContinue = () => {
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }
    navigate(activeRole.path);
  };

  const handleBack = () => {
    if (step === 0) {
      navigate('/');
      return;
    }
    setStep((current) => current - 1);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,241,53,0.18),_transparent_30%),linear-gradient(180deg,#0E0E0E_0%,#131313_100%)] px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <Card className="w-full overflow-hidden border-border/80 bg-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <CardContent className="grid gap-0 p-0 md:grid-cols-[1.1fr_0.9fr]">
            <section className="relative overflow-hidden border-b border-border/70 p-8 md:border-b-0 md:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(77,255,145,0.12),_transparent_35%)]" />
              <div className="relative">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                  <Sparkles className="size-3.5" />
                  Welcome Wizard
                </div>

                <div className="mb-8 flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2 flex-1 rounded-full transition-all',
                        index <= step ? 'bg-primary' : 'bg-secondary',
                      )}
                    />
                  ))}
                </div>

                {step === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h1 className="font-display text-4xl font-black tracking-tight">
                        Start with the path that fits how you use SubPool.
                      </h1>
                      <p className="max-w-xl text-sm text-muted-foreground">
                        This setup tunes your first-run flow so the dashboard opens with the right actions instead of a generic landing state.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {(['joiner', 'host'] as OnboardingRole[]).map((candidate) => {
                        const candidateCopy = roleCopy[candidate];
                        const CandidateIcon = candidateCopy.icon;

                        return (
                          <button
                            key={candidate}
                            type="button"
                            onClick={() => setRole(candidate)}
                            className={cn(
                              'rounded-2xl border p-5 text-left transition-all',
                              role === candidate
                                ? 'border-primary bg-primary/8 shadow-[0_0_0_1px_rgba(200,241,53,0.2)]'
                                : 'border-border bg-background hover:border-primary/30 hover:bg-secondary/20',
                            )}
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div className="grid size-12 place-items-center rounded-xl bg-secondary/50">
                                <CandidateIcon className="size-5 text-primary" />
                              </div>
                              {role === candidate && (
                                <div className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                                  <Check className="size-3.5" />
                                </div>
                              )}
                            </div>
                            <h2 className="font-display text-xl font-bold">{candidateCopy.title}</h2>
                            <p className="mt-2 text-sm text-muted-foreground">{candidateCopy.subtitle}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid size-14 place-items-center rounded-2xl bg-primary/12">
                      <ActiveIcon className="size-6 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <h1 className="font-display text-4xl font-black tracking-tight">{activeRole.title}</h1>
                      <p className="max-w-xl text-sm text-muted-foreground">{activeRole.subtitle}</p>
                    </div>
                    <div className="space-y-3">
                      {activeRole.checklist.map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3">
                          <div className="mt-0.5 grid size-6 place-items-center rounded-full bg-primary/12 text-primary">
                            <Check className="size-3.5" />
                          </div>
                          <p className="text-sm text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                      Ready
                    </div>
                    <div className="space-y-3">
                      <h1 className="font-display text-4xl font-black tracking-tight">
                        Your workspace is set for a {role === 'host' ? 'host-first' : 'joiner-first'} flow.
                      </h1>
                      <p className="max-w-xl text-sm text-muted-foreground">
                        Continue to {role === 'host' ? 'pool creation' : 'the browse marketplace'} now. You can still switch behavior later from your profile and settings.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        Next destination
                      </p>
                      <p className="mt-2 font-display text-2xl font-bold">
                        {role === 'host' ? 'List a Pool' : 'Browse Pools'}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {role === 'host'
                          ? 'Start with pricing, slot settings, and host trust signals.'
                          : 'Start with discovery, filtering, and live pool availability.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="flex flex-col justify-between bg-secondary/20 p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Why this exists
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold">Reduce first-run friction.</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Phase 4 is about turning the app from a feature set into a smoother product experience. This onboarding flow is the first layer of that.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleContinue} className="h-11 w-full justify-between font-display font-semibold">
                  {step < 2 ? 'Continue' : `Go to ${role === 'host' ? 'List a Pool' : 'Browse'}`}
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="ghost" onClick={handleBack} className="h-10 w-full font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {step === 0 ? 'Skip for now' : 'Back'}
                </Button>
              </div>
            </aside>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
