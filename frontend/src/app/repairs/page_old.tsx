'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import {
  Loader2,
  Search,
  Wrench,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

export default function RepairsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.get('/repairs');
        setRepairs(response.data);
      } catch (error) {
        console.error('Error fetching repairs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.userType === 'HITACHI') {
      fetchRepairs();
    }
  }, [isAuthenticated, user]);

  // Filter and paginate
  const filteredRepairs = useMemo(() => {
    let filtered = [...repairs];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.cassette?.serialNumber?.toLowerCase().includes(search) ||
          r.reportedIssue?.toLowerCase().includes(search) ||
          r.cassette?.customerBank?.bankName?.toLowerCase().includes(search)
      );
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    return filtered.sort((a, b) => new Date(b.receivedAtRc).getTime() - new Date(a.receivedAtRc).getTime());
  }, [repairs, searchTerm, selectedStatus]);

  const paginatedRepairs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRepairs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRepairs, currentPage]);

  const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);

  // Status summary
  const statusSummary = useMemo(() => ({
    total: repairs.length,
    received: repairs.filter(r => r.status === 'RECEIVED').length,
    diagnosing: repairs.filter(r => r.status === 'DIAGNOSING').length,
    onProgress: repairs.filter(r => r.status === 'ON_PROGRESS').length,
    completed: repairs.filter(r => r.status === 'COMPLETED').length,
  }), [repairs]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: string; icon: any }> = {
      RECEIVED: { label: 'Received', variant: 'bg-blue-500 text-white', icon: Package },
      DIAGNOSING: { label: 'Diagnosing', variant: 'bg-yellow-500 text-white', icon: AlertCircle },
      ON_PROGRESS: { label: 'On Progress', variant: 'bg-orange-500 text-white', icon: Wrench },
      COMPLETED: { label: 'Completed', variant: 'bg-green-500 text-white', icon: CheckCircle2 },
    };
    return configs[status] || { label: status, variant: 'bg-gray-500 text-white', icon: FileText };
  };

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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
            <p className="text-gray-600">Access denied. RC Staff only.</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repair Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total {filteredRepairs.length} repairs {selectedStatus !== 'ALL' ? `• ${getStatusBadge(selectedStatus).label}` : ''}
          </p>
        </div>
      </div>

      {/* Compact Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { key: 'ALL', label: 'Total', count: statusSummary.total, color: 'gray', icon: Wrench },
          { key: 'RECEIVED', label: 'Received', count: statusSummary.received, color: 'blue', icon: Package },
          { key: 'DIAGNOSING', label: 'Diagnosing', count: statusSummary.diagnosing, color: 'yellow', icon: AlertCircle },
          { key: 'ON_PROGRESS', label: 'On Progress', count: statusSummary.onProgress, color: 'orange', icon: Wrench },
          { key: 'COMPLETED', label: 'Completed', count: statusSummary.completed, color: 'green', icon: CheckCircle2 },
        ].map(({ key, label, count, color, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(selectedStatus === key ? 'ALL' : key)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedStatus === key
                ? `border-${color}-500 bg-${color}-50`
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <Icon className={`h-4 w-4 text-${color}-500 mb-1`} />
            <p className="text-xs text-gray-600 font-medium">{label}</p>
            <p className={`text-lg font-bold text-${color}-700`}>{count}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari cassette SN, issue, bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">CASSETTE</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">STATUS</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">ISSUE</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">BANK</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">RECEIVED</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">QC</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-700">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedRepairs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p>Tidak ada repair tickets</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRepairs.map((repair) => {
                    const statusBadge = getStatusBadge(repair.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr key={repair.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-mono font-bold text-sm text-gray-900">
                              {repair.cassette?.serialNumber || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {repair.cassette?.cassetteType?.typeCode || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${statusBadge.variant} text-[10px] px-2 py-0.5 gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-gray-900 truncate max-w-[200px]" title={repair.reportedIssue}>
                            {repair.reportedIssue || 'N/A'}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-gray-900 truncate max-w-[120px]">
                            {repair.cassette?.customerBank?.bankName || 'N/A'}
                          </p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            {repair.receivedAtRc
                              ? new Date(repair.receivedAtRc).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: '2-digit'
                                })
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-xs">
                            {repair.qcPassed === null
                              ? '⏳ Pending'
                              : repair.qcPassed
                                ? '✅ Pass'
                                : '❌ Fail'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <Link href={`/repairs/${repair.id}`}>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              {repair.status === 'COMPLETED' ? 'View' : 'Manage'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages} • Total {filteredRepairs.length} repairs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

