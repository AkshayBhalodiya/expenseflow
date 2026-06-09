'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api, NotificationItem } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    api.getNotifications().then((res) => {
      setNotifications(res.data);
      setUnreadCount(res.unreadCount || 0);
    }).catch(console.error);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const typeColors: Record<string, string> = {
    emi_due: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    budget_alert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    monthly_summary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    upcoming_bill: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    system: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">{unreadCount} unread notifications</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={async () => { await api.markAllRead(); fetchNotifications(); }}>
              <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No notifications</CardContent></Card>
          ) : (
            notifications.map((n) => (
              <Card key={n._id} className={!n.isRead ? 'border-primary/50 bg-primary/5' : ''}>
                <CardContent className="p-4 flex gap-4">
                  <Bell className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{n.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[n.type] || typeColors.system}`}>
                        {n.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
  );
}
