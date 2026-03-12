import { useMemo, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlist } from '../../lib/supabase/useWishlist';
import { useAuth } from '../../lib/supabase/auth';
import { getUserFacingError } from '../../lib/error-feedback';
import { formatPrice, getPlatform, PLATFORMS, timeAgo } from '../../lib/constants';
import type { WishlistRequest } from '../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { EmptyState } from '../components/empty-state';
import { cn } from '../components/ui/utils';

const PLATFORM_CHOICES = PLATFORMS.slice(0, 8).map((platform) => ({
  id: platform.id,
  icon: platform.icon,
  name: platform.name,
}));

const URGENCY_MAP: Record<string, string> = {
  high: 'ASAP',
  medium: 'Within a week',
  low: 'Flexible',
};

const URGENCY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const urgencyClass = (urgency: string) => {
  if (urgency === 'high') return 'text-destructive border-destructive/40 bg-destructive/10';
  if (urgency === 'low') return 'text-warning border-warning/40 bg-warning/10';
  if (urgency === 'medium') return 'text-primary border-primary/40 bg-primary/10';
  return 'text-muted-foreground border-border/50 bg-secondary/20';
};

function categoryOf(platformId: string): 'Entertainment' | 'Work' | 'AI' | 'Other' {
  const platform = getPlatform(platformId);
  const category = platform?.category?.toLowerCase() ?? '';
  if (category === 'entertainment') return 'Entertainment';
  if (category === 'work' || category === 'productivity') return 'Work';
  if (category === 'ai') return 'AI';
  return 'Other';
}

export function Wishlist() {
  const { user } = useAuth();
  const {
    data: requests,
    loading,
    error,
    postRequest,
    offerSlot,
    cancelRequest,
    reopenRequest,
    stats,
  } = useWishlist();

  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Entertainment' | 'Work' | 'AI'>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'budget' | 'urgent'>('recent');

  const [selectedPlatformId, setSelectedPlatformId] = useState('');
  const [planName, setPlanName] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('high');
  const [note, setNote] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [offerToastId, setOfferToastId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<WishlistRequest | null>(null);

  const wishlistErrorMessage = error ? getUserFacingError(error, 'load wishlist requests').message : null;
  const openRequests = useMemo(() => requests.filter((request) => request.status === 'open'), [requests]);

  const filteredRequests = useMemo(() => {
    let result = [...openRequests];

    if (selectedCategory !== 'All') {
      result = result.filter((request) => categoryOf(request.platform) === selectedCategory);
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'budget') {
      result.sort((a, b) => b.budget_max - a.budget_max);
    } else {
      result.sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 99) - (URGENCY_ORDER[b.urgency] ?? 99));
    }

    return result;
  }, [openRequests, selectedCategory, sortBy]);

  const resetForm = () => {
    setSelectedPlatformId('');
    setPlanName('');
    setBudget('');
    setUrgency('high');
    setNote('');
    setFormErrors([]);
    setIsSubmitting(false);
  };

  const handlePostRequest = async () => {
    const errors: string[] = [];
    if (!selectedPlatformId) errors.push('Select a platform.');
    if (!planName.trim()) errors.push('Add a plan name.');
    if (!budget || Number(budget) <= 0) errors.push('Enter a valid budget.');
    if (note.trim().length < 10) errors.push('Add at least 10 characters in your note.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setIsSubmitting(true);

    const success = await postRequest({
      platform: selectedPlatformId,
      budget_max: Math.round(Number(budget) * 100),
      urgency,
    });

    setIsSubmitting(false);

    if (success) {
      toast.success('Wishlist request posted. Hosts can now offer you a slot.');
      setShowPostModal(false);
      resetForm();
      return;
    }

    const friendly = getUserFacingError(error ?? 'Failed to post request', 'post wishlist request');
    toast.error(friendly.message);
  };

  const handleOfferSlot = async (requestId: string) => {
    setOfferToastId(requestId);
    const request = requests.find((item) => item.id === requestId);
    const success = await offerSlot(requestId);

    if (success) {
      const platformInfo = getPlatform(request?.platform ?? '');
      toast.success('Offer sent.', {
        description: `Requester was notified about your ${platformInfo?.name ?? 'pool'} slot.`,
      });
    } else {
      const friendly = getUserFacingError(error ?? 'Failed to offer slot', 'offer a slot');
      toast.error(friendly.message);
    }

    setTimeout(() => setOfferToastId(null), 2500);
  };

  const requestCancel = (request: WishlistRequest) => {
    setRequestToCancel(request);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!requestToCancel) return;

    const snapshot = requestToCancel;
    const success = await cancelRequest(snapshot.id);

    if (success) {
      const platform = getPlatform(snapshot.platform);
      toast.success('Request cancelled.', {
        description: `${platform?.name ?? snapshot.platform} is now hidden from matching.`,
        action: {
          label: 'Undo',
          onClick: async () => {
            const restored = await reopenRequest(snapshot.id);
            if (restored) {
              toast.success('Request restored.');
              return;
            }
            toast.error('Unable to restore request.');
          },
        },
      });
    } else {
      const friendly = getUserFacingError(error ?? 'Failed to cancel request', 'cancel wishlist request');
      toast.error(friendly.message);
    }

    setCancelDialogOpen(false);
    setRequestToCancel(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 text-center">
        <p role="status" aria-live="polite" className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {wishlistErrorMessage && (
        <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
          <p className="font-mono text-xs text-warning">Warning: {wishlistErrorMessage}</p>
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight">Wishlist</h1>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground">
            Discover what members need and convert demand into filled slots.
          </p>
        </div>
        <Button onClick={() => setShowPostModal(true)} className="w-full sm:w-auto">
          <Plus className="size-4" aria-hidden="true" />
          Post Request
        </Button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Open Requests</p>
            <p className="font-display text-3xl font-bold mt-1">{stats.open}</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-1">Current demand in queue</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Fulfilled</p>
            <p className="font-display text-3xl font-bold mt-1">{stats.fulfilled}</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-1">Requests successfully matched</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Avg Match Time</p>
            <p className="font-display text-3xl font-bold mt-1">{stats.avgMatchTime}</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-1">Request to slot offer</p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Entertainment', 'Work', 'AI'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/30',
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="wishlist-sort" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Sort
          </label>
          <select
            id="wishlist-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="h-9 rounded-md border border-input bg-input-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="recent">Most Recent</option>
            <option value="budget">Highest Budget</option>
            <option value="urgent">Urgent First</option>
          </select>
        </div>
      </section>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No requests in this view"
          description="Try another filter or post the first request for this category."
        />
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredRequests.map((request) => {
            const platform = getPlatform(request.platform);
            const displayName = request.user?.display_name ?? request.user?.username ?? 'Member';
            const isOwnRequest = request.user_id === user?.id;

            return (
              <Card key={request.id} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-md bg-secondary/40 border border-border/60 grid place-items-center text-lg">
                        {platform?.icon ?? '📦'}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="font-display text-base truncate">
                          {platform?.name ?? request.platform}
                        </CardTitle>
                        <p className="font-mono text-[11px] text-muted-foreground mt-1">{timeAgo(request.created_at)}</p>
                      </div>
                    </div>
                    <Badge className={`border ${urgencyClass(request.urgency)} font-mono text-[10px] uppercase tracking-wider`}>
                      {URGENCY_MAP[request.urgency] ?? request.urgency}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-md border border-border/70 bg-secondary/20 px-3 py-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Budget: <span className="text-primary font-semibold">{formatPrice(request.budget_max)}/mo</span>
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Need by: {URGENCY_MAP[request.urgency] ?? request.urgency}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-8">
                        <AvatarFallback
                          className="text-[10px] font-bold text-black"
                          style={{ backgroundColor: request.user?.avatar_color ?? '#C8F135' }}
                        >
                          {displayName
                            .split(' ')
                            .map((chunk) => chunk[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-display text-sm truncate">{displayName}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">Rating {request.user?.rating ?? '—'}</p>
                      </div>
                    </div>

                    {isOwnRequest ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => requestCancel(request)}
                      >
                        Cancel Request
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={offerToastId === request.id ? 'default' : 'outline'}
                        onClick={() => handleOfferSlot(request.id)}
                      >
                        {offerToastId === request.id ? 'Offer Sent' : 'Offer Slot'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section >
      )
      }

      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) setRequestToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this wishlist request?</AlertDialogTitle>
            <AlertDialogDescription>
              {requestToCancel
                ? `This hides your ${getPlatform(requestToCancel.platform)?.name ?? requestToCancel.platform} request from hosts.`
                : 'This request will be hidden from hosts.'}
              {' '}You can undo immediately after confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Confirm Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={showPostModal}
        onOpenChange={(open) => {
          setShowPostModal(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Post a Wishlist Request</DialogTitle>
            <DialogDescription>
              Tell hosts what you need and what you can pay. Requests stay visible for 30 days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {formErrors.length > 0 && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 space-y-1">
                {formErrors.map((formError) => (
                  <p key={formError} className="font-mono text-xs text-destructive">{formError}</p>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Platform</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLATFORM_CHOICES.map((platform) => {
                  const selected = selectedPlatformId === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelectedPlatformId(platform.id)}
                      className={cn(
                        'rounded-md border px-2 py-3 transition-colors text-center',
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-secondary/10 hover:bg-secondary/30',
                      )}
                    >
                      <p className="text-xl leading-none">{platform.icon}</p>
                      <p className="font-mono text-[10px] mt-2">{platform.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="wishlist-budget" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Max Budget ($/mo)
                </label>
                <Input
                  id="wishlist-budget"
                  type="number"
                  min={1}
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="wishlist-urgency" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Urgency
                </label>
                <select
                  id="wishlist-urgency"
                  value={urgency}
                  onChange={(event) => setUrgency(event.target.value as typeof urgency)}
                  className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="high">ASAP</option>
                  <option value="medium">Within a week</option>
                  <option value="low">Flexible</option>
                </select>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostModal(false)}>Cancel</Button>
            <Button onClick={handlePostRequest} disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Request'}
              {!isSubmitting && <Sparkles className="size-4" aria-hidden="true" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
