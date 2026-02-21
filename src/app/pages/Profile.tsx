import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useAuth } from '../../lib/supabase/auth';
import { supabase } from '../../lib/supabase/client';
import { toast } from 'sonner';
import { Insight } from '../components/demo-mode';

export function Profile() {
  const { user, profile, loading, signOut } = useAuth();
  const [settings, setSettings] = useState({
    autoApprove: false,
    profilePublic: true,
    allNotifs: true,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Pools Owned', value: String(profile?.review_count || 0) }, // Using review_count as a placeholder for stats
    { label: 'Rating', value: `⭐ ${profile?.rating || '0.0'}` },
    { label: 'Member Since', value: profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025' },
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
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* HERO CARD */}
      <Card className="border-border">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Avatar className="size-[80px] shrink-0 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-display font-black text-4xl">
                {(profile?.username?.[0] ?? 'Y').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="font-display font-bold text-3xl">{profile?.username ?? 'You'}</h2>
                <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                  {profile ? `@${profile.username}` : '@yourusername'} · member since {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2025'}
                </p>
                {profile?.bio && (
                  <p className="text-sm text-foreground/80 mt-3 max-w-xl">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-1 relative">
                    <p className="font-display font-bold text-2xl text-foreground">
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