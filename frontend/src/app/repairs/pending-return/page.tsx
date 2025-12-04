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
  Truck,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function PendingReturnPage() {
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
      if (!isAuthenticated || user?.userType !== 'HITACHI') return;

      try {
        setLoading(true);
        const response = await api.get('/repairs/pending-return', {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });

        setData(response.data.data || []);
        setStatistics(response.data.statistics || null);
        setPagination(response.data.pagination || null);
      } catch (error: any) {
        console.error('Error fetching pending returns:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load pending returns',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.userType === 'HITACHI') {
      fetchData();
    }
  }, [isAuthenticated, user, currentPage, itemsPerPage, toast]);

  const getUrgencyBadge = (urgency: string, days: number) => {
    const configs: Record<string, { label: string; variant: string; icon: any; color: string }> = {
      normal: {
        label: 'Normal',
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
    const headers = ['Ticket Number', 'Cassette Serial Number', 'Type', 'Bank', 'Days in RC', 'Urgency', 'Completed At'];
    const rows: any[] = [];
    data.forEach((ticketGroup: any) => {
      ticketGroup.cassettes.forEach((cassette: any) => {
        rows.push([
          ticketGroup.ticketNumber,
          cassette.serialNumber,
          cassette.cassetteType?.typeCode || 'N/A',
          cassette.customerBank?.bankName || 'N/A',
          cassette.daysInRc,
          cassette.urgency,
          cassette.completedAt ? new Date(cassette.completedAt).toLocaleDateString('id-ID') : 'N/A',
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pending-returns-${new Date().toISOString().split('T')[0]}.csv`;
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

  if (!isAuthenticated || user?.userType !== 'HITACHI') {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Akses Ditolak</p>
            <p className="text-sm text-muted-foreground mt-2">
              Halaman ini hanya dapat diakses oleh RC Staff (Hitachi).
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
              onClick={() => router.push('/repairs')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Pending Return</h1>
              <p className="text-sm text-muted-foreground">
                Tiket dengan kaset yang sudah diperbaiki dan perlu dikirim kembali ke pengelola (dikelompokkan berdasarkan tiket)
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tiket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalTickets || pagination?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Tiket perlu dikirim</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Kaset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Kaset perlu dikirim</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.averageDaysInRc}</div>
                <p className="text-xs text-muted-foreground mt-1">Hari di RC</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Over SLA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statistics.overSlaThreshold}
                </div>
                <p className="text-xs text-muted-foreground mt-1">≥ 7 hari di RC</p>
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
            <CardTitle>Daftar Tiket yang Perlu Dikirim</CardTitle>
            <CardDescription>
              Tiket dikelompokkan berdasarkan Service Order (SO). Setiap tiket menampilkan semua kaset yang sudah diperbaiki dan perlu dikirim kembali ke pengelola.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Tidak ada tiket pending return</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Semua kaset sudah dikirim atau belum siap untuk dikirim.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((ticketGroup: any) => (
                  <div
                    key={ticketGroup.ticketId}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          <Link 
                            href={`/tickets/${ticketGroup.ticketId}`}
                            className="font-mono font-semibold text-lg hover:underline"
                          >
                            {ticketGroup.ticketNumber}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {ticketGroup.ticketStatus}
                          </Badge>
                          {getUrgencyBadge(ticketGroup.maxUrgency, ticketGroup.maxDaysInRc)}
                          <Badge variant="outline" className="text-xs">
                            {ticketGroup.cassettes.length} {ticketGroup.cassettes.length === 1 ? 'Kaset' : 'Kaset'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Max Days in RC</p>
                            <p className="font-medium flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {ticketGroup.maxDaysInRc} hari
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Earliest Completed At</p>
                            <p className="font-medium">
                              {ticketGroup.earliestCompletedAt
                                ? new Date(ticketGroup.earliestCompletedAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bank</p>
                            <p className="font-medium">
                              {ticketGroup.cassettes[0]?.customerBank?.bankName || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/tickets/${ticketGroup.ticketId}/return`}>
                          <Button>
                            <Truck className="h-4 w-4 mr-2" />
                            Create Return
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {/* List of cassettes in this ticket */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Daftar Kaset:</p>
                      <div className="space-y-2">
                        {ticketGroup.cassettes.map((cassette: any) => (
                          <div
                            key={cassette.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium">{cassette.serialNumber}</span>
                              <Badge variant="outline" className="text-xs">
                                {cassette.cassetteType?.typeCode || 'N/A'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {cassette.daysInRc} hari di RC
                              </span>
                            </div>
                            {cassette.completedAt && (
                              <span className="text-xs text-muted-foreground">
                                Selesai: {new Date(cassette.completedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            )}
                          </div>
                        ))}
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

