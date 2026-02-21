import { useState, useMemo } from 'react';
import { NotificationItem } from '../components/subpool-components';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/empty-state';
import { MOCK_NOTIFICATIONS } from '../../lib/mock-data';
import { toast } from 'sonner';
import type { Notification } from '../../lib/types';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Sorted: unread first, then by created_at desc
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleApprove = (id: string) => {
    markRead(id);
    toast.success('Request approved ✓');
  };

  const handleDecline = (id: string) => {
    markRead(id);
    toast.info('Request declined');
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="text-muted-foreground hover:text-foreground"
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
      <div className="space-y-1">
        {sortedNotifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onRead={markRead}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        ))}
      </div>

      {/* Empty State */}
      {(notifications.length === 0 || (unreadCount === 0 && sortedNotifications.length === 0)) && (
        <EmptyState
          icon="🔔"
          title="All caught up"
          description="No new notifications at this time. We'll let you know when something happens."
        />
      )}

      {unreadCount === 0 && sortedNotifications.length > 0 && (
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            End of notifications
          </p>
        </div>
      )}
    </div>
  );
}