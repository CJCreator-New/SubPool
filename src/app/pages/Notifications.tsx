import { useMemo, useState } from 'react';
import { NotificationItem } from '../components/subpool-components';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/empty-state';
import { PageLoadSkeleton } from '../components/skeletons';
import { useNotifications } from '../../lib/supabase/hooks';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export function Notifications() {
  const {
    data: notifications,
    loading,
    error,
    markRead: markNotifRead,
    markUnread: markNotifUnread,
    markAllRead: markAllNotifRead,
  } = useNotifications();
  const [page, setPage] = useState(1);
  const notificationsList = Array.isArray(notifications) ? notifications : [];

  // Sorted: unread first, then by created_at desc
  const sortedNotifications = useMemo(() => {
    return [...notificationsList].sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notificationsList]);

  const totalPages = Math.ceil(sortedNotifications.length / PAGE_SIZE);
  const pagedNotifications = sortedNotifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const needsAction = pagedNotifications.filter((notification) => {
    const lowerTitle = notification.title.toLowerCase();
    return !notification.read || lowerTitle.includes('join request');
  });
  const today = pagedNotifications.filter((notification) => {
    if (needsAction.some((item) => item.id === notification.id)) return false;
    return new Date(notification.created_at).getTime() >= startOfToday.getTime();
  });
  const earlier = pagedNotifications.filter((notification) => {
    if (needsAction.some((item) => item.id === notification.id)) return false;
    return new Date(notification.created_at).getTime() < startOfToday.getTime();
  });

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markNotifRead(id);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notificationsList.filter((notification) => !notification.read).map((notification) => notification.id);
    await markAllNotifRead();
    setPage(1);
    toast.success('All notifications marked as read', {
      action: {
        label: 'Undo',
        onClick: async () => {
          await Promise.all(unreadIds.map((id) => markNotifUnread(id)));
          toast.success('Notification state restored.');
        },
      },
    });
  };

  const handleApprove = async (id: string) => {
    await markNotifRead(id);
    toast.success('Request approved', {
      action: {
        label: 'Undo',
        onClick: async () => {
          await markNotifUnread(id);
          toast.success('Approval action undone.');
        },
      },
    });
  };

  const handleDecline = async (id: string) => {
    await markNotifRead(id);
    toast.info('Request declined', {
      action: {
        label: 'Undo',
        onClick: async () => {
          await markNotifUnread(id);
          toast.success('Decline action undone.');
        },
      },
    });
  };

  const handleDismiss = async (id: string) => {
    await markNotifRead(id);
    toast.info('Notification dismissed', {
      action: {
        label: 'Undo',
        onClick: async () => {
          await markNotifUnread(id);
          toast.success('Notification restored.');
        },
      },
    });
  };

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading notifications">
        <PageLoadSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <p className="font-mono text-xs text-amber-500">
            <span role="img" aria-label="Warning">⚠</span> {error}
          </p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl">Notifications</h1>
          {unreadCount > 0 && (
            <span
              className="bg-primary text-primary-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Mark all notifications as read"
        >
          Mark all read
        </Button>
      </div>

      {unreadCount > 0 && (
        <div className="mb-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {unreadCount} unread
          </span>
        </div>
      )}

      {/* Notification List */}
      {notificationsList.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="All caught up"
          description="No new notifications at this time. We'll let you know when something happens."
        />
      ) : (
        <>
          <div className="space-y-4" role="list" aria-label="Notifications">
            {[
              { id: 'needs-action', title: 'Needs Action', items: needsAction },
              { id: 'today', title: 'Today', items: today },
              { id: 'earlier', title: 'Earlier', items: earlier },
            ]
              .filter((section) => section.items.length > 0)
              .map((section) => (
                <section key={section.id} className="space-y-2" aria-labelledby={`notifications-${section.id}`}>
                  <h2
                    id={`notifications-${section.id}`}
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-1">
                    {section.items.map((notif) => (
                      <div key={notif.id} role="listitem">
                        <NotificationItem
                          notification={notif}
                          onRead={handleMarkRead}
                          onApprove={handleApprove}
                          onDecline={handleDecline}
                          onDismiss={handleDismiss}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <span className="font-mono text-[11px] text-muted-foreground">
                Page {page} of {totalPages} - {sortedNotifications.length} total
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="font-mono text-xs h-8"
                  aria-label="Previous page of notifications"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="font-mono text-xs h-8"
                  aria-label="Next page of notifications"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {unreadCount === 0 && page === totalPages && (
            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                End of notifications
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
