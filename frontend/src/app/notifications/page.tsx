'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-gray-600">Memuat notifikasi...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n) => !n.read) 
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SO_STATUS_CHANGE':
      case 'TICKET_STATUS_CHANGE': // Legacy support
        return '🔄';
      case 'SO_CREATED':
      case 'TICKET_CREATED': // Legacy support
        return '📝';
      case 'DELIVERY_RECEIVED':
        return '📦';
      case 'REPAIR_COMPLETED':
        return '✅';
      case 'CASSETTE_RETURNED':
        return '🔙';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageLayout>
      {/* Filter & Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Semua ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Belum Dibaca ({unreadCount})
              </Button>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Tandai Semua Dibaca
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')) {
                      clearNotifications();
                    }
                  }}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus Semua
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg mb-2">
              {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca' : 'Tidak ada notifikasi'}
            </p>
            <p className="text-sm text-gray-400">
              {filter === 'unread' 
                ? 'Semua notifikasi sudah dibaca' 
                : 'Notifikasi akan muncul di sini ketika ada update'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'border-2 transition-all hover:shadow-lg',
                !notification.read ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'
              )}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-4xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge className="bg-blue-500 text-white text-xs mt-1">
                            Baru
                          </Badge>
                        )}
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <Check className="h-4 w-4" />
                          Tandai Dibaca
                        </Button>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Ticket Link */}
                      {notification.ticketNumber && notification.ticketId && (
                        <Link
                          href={`/tickets/${notification.ticketId}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Button size="sm" variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            {notification.ticketNumber}
                          </Button>
                        </Link>
                      )}

                      {/* Status Change Info */}
                      {notification.oldStatus && notification.newStatus && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-gray-100">
                            {notification.oldStatus}
                          </Badge>
                          <span className="text-gray-400">→</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {notification.newStatus}
                          </Badge>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
                        <Clock className="h-4 w-4" />
                        {getTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

