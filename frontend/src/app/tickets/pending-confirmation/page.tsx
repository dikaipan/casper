'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Download,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function PendingConfirmationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || user?.userType !== 'PENGELOLA') return;

      try {
        setLoading(true);
        const response = await api.get('/tickets/pending-confirmation', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });

        setData(response.data.data || []);
        setStatistics(response.data.statistics || null);
        setPagination(response.data.pagination || null);
      } catch (error: any) {
        console.error('Error fetching pending confirmations:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load pending confirmations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.userType === 'PENGELOLA') {
      fetchData();
    }
  }, [isAuthenticated, user, currentPage, itemsPerPage, toast]);

  const getUrgencyBadge = (urgency: string, days: number) => {
    const configs: Record<string, { label: string; variant: string; icon: any; color: string }> = {
      normal: {
        label: 'Baru Tiba',
        variant: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: CheckCircle2,
        color: 'green',
      },
      attention: {
        label: 'Perlu Perhatian',
        variant: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: AlertCircle,
        color: 'yellow',
      },
      urgent: {
        label: 'Urgent',
        variant: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        icon: AlertTriangle,
        color: 'orange',
      },
      very_urgent: {
        label: 'Sangat Urgent',
        variant: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: XCircle,
        color: 'red',
      },
    };

    const config = configs[urgency] || configs.normal;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label} ({days} hari)
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Serial Number', 'Type', 'Bank', 'Days Waiting', 'Urgency', 'Pickup Date', 'Ticket Number'];
    const rows = data.map((c) => [
      c.serialNumber,
      c.cassetteType?.typeCode || 'N/A',
      c.customerBank?.bankName || 'N/A',
      c.daysWaiting,
      c.urgency,
      c.returnRecord?.shippedDate ? new Date(c.returnRecord.shippedDate).toLocaleDateString('id-ID') : 'N/A',
      c.returnRecord?.ticketNumber || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pending-confirmations-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-[#2563EB]" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated || user?.userType !== 'PENGELOLA') {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Akses Ditolak</p>
            <p className="text-sm text-muted-foreground mt-2">
              Halaman ini hanya dapat diakses oleh Pengelola.
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/tickets')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pending Confirmation</h1>
              <p className="text-sm text-muted-foreground">
                Dengan flow pickup-based yang baru, kaset langsung berstatus OK setelah RC mengonfirmasi pickup. Tidak ada lagi proses konfirmasi penerimaan.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={data.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Kaset perlu dikonfirmasi</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.averageDaysWaiting}</div>
                <p className="text-xs text-muted-foreground mt-1">Hari menunggu konfirmasi</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Over Threshold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statistics.overThreshold}
                </div>
                <p className="text-xs text-muted-foreground mt-1">≥ 3 hari menunggu</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Urgent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {statistics.byUrgency.urgent + statistics.byUrgency.very_urgent}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Urgent + Very Urgent</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kaset yang Perlu Dikonfirmasi</CardTitle>
            <CardDescription>
              <strong>Flow Baru - Pickup-Based:</strong> Setelah repair selesai, Pengelola mengambil kaset langsung di RC. 
              RC staff mengonfirmasi pickup, dan status kaset langsung berubah menjadi OK. 
              Tidak ada lagi proses konfirmasi penerimaan yang diperlukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                <p className="text-lg font-semibold">Tidak ada kaset pending confirmation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Dengan flow pickup-based yang baru, semua kaset langsung berstatus OK setelah RC mengonfirmasi pickup di RC.
                </p>
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-3xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Flow Baru - Pickup-Based</h3>
                      <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                        <p><strong>1. Repair Selesai:</strong> Kaset selesai diperbaiki dan siap untuk diambil</p>
                        <p><strong>2. Pickup di RC:</strong> Pengelola datang ke RC untuk mengambil kaset</p>
                        <p><strong>3. Konfirmasi Pickup:</strong> RC staff mengonfirmasi pickup di sistem</p>
                        <p><strong>4. Status OK:</strong> Kaset langsung berstatus OK, tidak perlu konfirmasi penerimaan lagi</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/tickets">
                    <Button>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Kembali ke Service Orders
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((cassette) => (
                  <div
                    key={cassette.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-mono font-semibold text-lg">{cassette.serialNumber}</span>
                          {getUrgencyBadge(cassette.urgency, cassette.daysWaiting)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium">{cassette.cassetteType?.typeCode || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bank</p>
                            <p className="font-medium">{cassette.customerBank?.bankName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Days Waiting</p>
                            <p className="font-medium flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {cassette.daysWaiting} hari
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pickup Date</p>
                            <p className="font-medium">
                              {cassette.returnRecord?.shippedDate
                                ? new Date(cassette.returnRecord.shippedDate).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {cassette.returnRecord && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm">
                            <p className="text-muted-foreground mb-1">Pickup Info:</p>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">Pickup Date: </span>
                                <span className="font-medium">
                                  {cassette.returnRecord.shippedDate
                                    ? new Date(cassette.returnRecord.shippedDate).toLocaleDateString('id-ID')
                                    : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Ticket: </span>
                                <span className="font-medium">{cassette.returnRecord.ticketNumber || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {cassette.returnRecord?.ticketId && (
                          <Link href={`/tickets/${cassette.returnRecord.ticketId}`}>
                            <Button variant="outline">
                              <Package className="h-4 w-4 mr-2" />
                              View Ticket
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

