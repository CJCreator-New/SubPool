import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../../lib/supabase/hooks';
import type { Notification } from '../../lib/types';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function NotificationPreview({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
        notification.read
          ? 'border-border/60 bg-background hover:bg-secondary/30'
          : 'border-primary/20 bg-primary/5 hover:bg-primary/10',
      )}
    >
      <span className="text-lg leading-none">{notification.icon ?? '🔔'}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-display text-sm font-semibold text-foreground">
            {notification.title}
          </p>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {timeAgo(notification.created_at)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 font-mono text-[11px] text-muted-foreground">
          {notification.body}
        </p>
      </div>
    </button>
  );
}

export function NotificationBell({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { data, unreadCount, markRead, markAllRead } = useNotifications({ allowDemoFallback: true });
  const notifications = (data ?? []).slice(0, 5);

  const handleOpen = async (notification: Notification) => {
    if (!notification.read) {
      await markRead(notification.id);
    }
    navigate(notification.action_url || '/notifications');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative h-9 w-9 rounded-full', className)}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] border-border bg-card p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-display text-sm font-semibold">Notifications</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {unreadCount} unread
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0}
            className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            Mark all read
          </Button>
        </div>
        <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
          {notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <p className="font-display text-sm font-semibold">All caught up</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                New activity will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationPreview
                key={notification.id}
                notification={notification}
                onOpen={(item) => void handleOpen(item)}
              />
            ))
          )}
        </div>
        <div className="border-t border-border px-3 py-3">
          <Button
            variant="outline"
            className="w-full font-mono text-[11px] uppercase tracking-wider"
            onClick={() => navigate('/notifications')}
          >
            Open Notification Center
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
