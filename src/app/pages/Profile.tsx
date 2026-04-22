import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { supabase } from '../../lib/supabase/client';
import { cn } from '../components/ui/utils';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useAuth } from '../../lib/supabase/auth';
import { toast } from 'sonner';
import { track } from '../../lib/analytics';
import { Insight } from '../components/demo-mode';
import { getUserFacingError } from '../../lib/error-feedback';
import { 
  ShieldCheck, 
  UserCheck, 
  Camera, 
  CreditCard, 
  Zap, 
  Award 
} from 'lucide-react';
import {
  fetchReminderPreferences,
  upsertReminderPreferences,
  ReminderPreferencesRecord,
} from '../../lib/supabase/reminder-preferences';
import { Setup2FA } from '../components/security/setup-2fa';
import { useReferralStats } from '../../lib/supabase/hooks';

type ReminderPreferences = {
  allNotifs: boolean;
  paymentReminders: boolean;
  weeklyDigest: boolean;
  profilePublic: boolean;
};

const REMINDERS_KEY = 'subpool:reminders';

function toPreferencePayload(userId: string, settings: ReminderPreferences): ReminderPreferencesRecord {
  return {
    user_id: userId,
    all_notifs: settings.allNotifs,
    payment_reminders: settings.paymentReminders,
    weekly_digest: settings.weeklyDigest,
    digest_day: 1,
    digest_hour_utc: 9,
  };
}

export function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const { stats } = useReferralStats();
  const [settings, setSettings] = useState<ReminderPreferences>({
    profilePublic: true,
    allNotifs: true,
    paymentReminders: true,
    weeklyDigest: true,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ReminderPreferences;
      setSettings(parsed);
    } catch {
      // ignore malformed local state
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    fetchReminderPreferences(user.id)
      .then((pref) => {
        if (!mounted) return;
        setSettings((prev) => ({
          ...prev,
          allNotifs: pref.all_notifs,
          paymentReminders: pref.payment_reminders,
          weeklyDigest: pref.weekly_digest,
        }));
      })
      .catch((error) => {
        console.warn('Failed to load reminder preferences:', error);
      });

    return () => { mounted = false; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profileStats = [
    { label: 'Pools Owned', value: String(profile?.review_count || 0) }, // Using review_count as a placeholder for stats
    { label: 'Rating', value: `⭐ ${profile?.rating || '0.0'}` },
    { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025' },
  ];

  const handleSaveProfile = async () => {
    if (!user || !supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          bio: editForm.bio,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      const friendly = getUserFacingError(error, 'update your profile');
      toast.error(friendly.message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof ReminderPreferences, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value } as ReminderPreferences;
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
      if (user?.id && (key === 'allNotifs' || key === 'paymentReminders' || key === 'weeklyDigest')) {
        upsertReminderPreferences(toPreferencePayload(user.id, next)).catch((error) => {
          console.warn('Failed to persist reminder preferences:', error);
        });
      }
      track('activation_step_completed', { step: 'notification_interaction' });
      return next;
    });
  };

  const referralUrl = profile?.referral_code
    ? `subpool.app/ref/${profile.referral_code}`
    : 'subpool.app/ref/unknown';

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 px-4 noise-overlay min-h-screen">
      {/* HERO CARD */}
      <Card className="border-white/5 bg-transparent glass-premium overflow-hidden shadow-premium">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <Avatar className="size-[100px] shrink-0 border-2 border-primary/20 shadow-glow-primary ring-4 ring-black/50">
                <AvatarFallback className="bg-gradient-to-br from-primary to-[#86A61F] text-primary-foreground font-display font-black text-4xl">
                  {(profile?.username?.[0] ?? 'Y').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 size-8 rounded-full bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                <Camera size={14} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display font-black text-4xl tracking-tighter text-foreground">{profile?.username ?? 'You'}</h2>
                  <div className="flex items-center gap-2">
                    {profile?.is_verified && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                        <ShieldCheck size={10} className="fill-blue-500/10" />
                        <span className="font-mono text-[8px] font-black uppercase tracking-[0.1em]">Verified</span>
                      </div>
                    )}
                    {profile?.is_pro && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-primary shadow-[0_0_10px_rgba(200,241,53,0.1)]">
                        <Award size={10} className="fill-primary/10" />
                        <span className="font-mono text-[8px] font-black uppercase tracking-[0.1em]">Pro Member</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-60">
                  {profile ? `@${profile.username}` : '@yourusername'} · member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className={cn(
                    "px-3 py-1 rounded-lg border text-[10px] font-black tracking-widest uppercase transition-all duration-500",
                    profile?.plan === 'host_plus' ? "text-[#EAB308] border-[#EAB308]/40 bg-[#EAB308]/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]" :
                      profile?.plan === 'pro' ? "text-primary border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(200,241,53,0.1)]" :
                        "text-muted-foreground border-border/60 bg-muted/20"
                  )}>
                    {profile?.plan?.replace('_', ' ') ?? 'FREE'}
                  </span>
                  {profile?.plan === 'free' && (
                    <button
                      onClick={() => navigate('/plans')}
                      className="group flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
                    >
                      <Zap size={10} className="text-primary group-hover:animate-pulse" />
                      <span className="text-[10px] font-mono font-bold text-muted-foreground group-hover:text-primary tracking-tight">Upgrade Pipeline</span>
                    </button>
                  )}
                </div>
                {profile?.bio && (
                  <p className="text-sm text-foreground/80 mt-3 max-w-xl">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-2">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="space-y-1 relative">
                    <p className="font-display font-black text-2xl text-foreground">
                      {stat.value}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      {stat.label}
                    </p>
                    {stat.label === 'Rating' && (
                      <Insight id="profile-rating" activeStep={10} className="top-1/2 left-full ml-6 -translate-y-1/2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex shrink-0 border-muted-foreground/30"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-6 md:hidden border-muted-foreground/30"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-border bg-card shadow-2xl">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-display font-bold text-xl">Edit Profile</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase tracking-widest font-mono">Username</Label>
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs uppercase tracking-widest font-mono">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="border-border min-h-[100px]"
                    placeholder="Tell the community a bit about yourself..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SETTINGS CARD */}
      <Card className="border-border bg-card/30">
        <CardContent className="p-6">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Account Settings
          </h3>

          <div className="space-y-1">
            <div className="flex justify-between items-center py-5 border-b border-border/50">
              <div className="space-y-1">
                <p className="font-display font-semibold text-[15px]">Email</p>
                <p className="font-mono text-xs text-primary/80 mt-0.5">
                  {user?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center py-5 border-b border-border/50">
              <div className="space-y-1">
                <p className="font-display font-semibold text-[15px]">Profile Visibility</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Make your profile visible to others in the marketplace
                </p>
              </div>
              <Switch
                checked={settings.profilePublic}
                onCheckedChange={(checked) => handleToggle('profilePublic', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex justify-between items-center py-5">
              <div className="space-y-1">
                <p className="font-display font-semibold text-[15px]">Notifications</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Receive alerts for join requests and payments
                </p>
              </div>
              <Switch
                checked={settings.allNotifs}
                onCheckedChange={(checked) => handleToggle('allNotifs', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex justify-between items-center py-5 border-t border-border/50">
              <div className="space-y-1">
                <p className="font-display font-semibold text-[15px]">Payment Reminders</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Send in-app reminders before due dates
                </p>
              </div>
              <Switch
                checked={settings.paymentReminders}
                onCheckedChange={(checked) => handleToggle('paymentReminders', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex justify-between items-center py-5 border-t border-border/50">
              <div className="space-y-1">
                <p className="font-display font-semibold text-[15px]">Weekly Digest</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Receive summary of savings and pending actions
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => handleToggle('weeklyDigest', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex flex-col py-5 border-t border-border/50 gap-3">
              <div className="flex justify-between items-center">
                <div className="space-y-1 overflow-hidden pr-4">
                  <p className="font-display font-semibold text-sm">Security</p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate">
                    Manage 2FA and account security
                  </p>
                </div>
              </div>
              <Setup2FA />
            </div>

            <div className="flex flex-col py-5 border-t border-border/50 gap-3">
              <div className="flex justify-between items-center">
                <div className="space-y-1 overflow-hidden pr-4">
                  <p className="font-display font-semibold text-sm">Invite friends</p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-[250px]">
                    {referralUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-secondary/50 rounded-lg border border-border/40 text-[10px] font-mono">
                        {stats.count} REFS
                    </div>
                    <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={async () => {
                        await navigator.clipboard.writeText(referralUrl);
                        toast.success("Referral link copied!");
                        track('referral_link_copied', {});
                    }}
                    >
                    📋 Copy
                    </Button>
                </div>
              </div>
              <div className="self-start bg-primary/5 border border-primary/20 rounded px-2 py-1">
                <span className="font-mono text-[10px] text-primary">
                    {stats.count >= 3 ? "Mission Complete: Pro Status Unlocked" : `Invite ${3 - (stats.count % 3)} more friends → unlock Pro for 1 month`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/5 text-xs font-mono uppercase tracking-widest"
          onClick={() => signOut()}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
