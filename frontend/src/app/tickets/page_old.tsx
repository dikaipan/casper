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
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  FileText,
  Wrench,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Truck as TruckIcon,
  Plus,
  Clock,
  User,
  Monitor,
} from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const isHitachi = user?.userType === 'HITACHI';
  const isPengelola = user?.userType === 'PENGELOLA';

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets');
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  // Filter and paginate
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.ticketNumber?.toLowerCase().includes(search) ||
          t.title?.toLowerCase().includes(search) ||
          t.cassette?.serialNumber?.toLowerCase().includes(search) ||
          t.machine?.serialNumberManufacturer?.toLowerCase().includes(search)
      );
    }

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }

    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter((t) => t.priority === selectedPriority);
    }

    return filtered.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }, [tickets, searchTerm, selectedStatus, selectedPriority]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  // Status summary
  const statusSummary = useMemo(() => ({
    total: tickets.length,
    inDelivery: tickets.filter(t => t.status === 'IN_DELIVERY').length,
    received: tickets.filter(t => t.status === 'RECEIVED').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    returnShipped: tickets.filter(t => t.status === 'RETURN_SHIPPED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  }), [tickets]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: string; icon: any }> = {
      OPEN: { label: 'Open', variant: 'bg-blue-500 text-white', icon: AlertCircle },
      IN_DELIVERY: { label: 'Kirim RC', variant: 'bg-cyan-500 text-white', icon: Package },
      RECEIVED: { label: 'Terima RC', variant: 'bg-blue-600 text-white', icon: Inbox },
      IN_PROGRESS: { label: 'Repair', variant: 'bg-yellow-500 text-white', icon: Wrench },
      RESOLVED: { label: 'Selesai', variant: 'bg-green-500 text-white', icon: CheckCircle2 },
      RETURN_SHIPPED: { label: 'Kirim Vendor', variant: 'bg-purple-500 text-white', icon: TruckIcon },
      CLOSED: { label: 'Tutup', variant: 'bg-gray-500 text-white', icon: XCircle },
    };
    return configs[status] || configs.OPEN;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'text-red-600',
      HIGH: 'text-orange-600',
      MEDIUM: 'text-yellow-600',
      LOW: 'text-green-600',
    };
    return colors[priority] || colors.MEDIUM;
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total {filteredTickets.length} SO {selectedStatus !== 'ALL' ? `• ${getStatusBadge(selectedStatus).label}` : ''}
          </p>
        </div>
        {isPengelola && (
          <Link href="/tickets/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Buat SO
            </Button>
          </Link>
        )}
        {isHitachi && (
          <Link href="/repairs">
            <Button variant="outline">
              <Wrench className="h-4 w-4 mr-2" />
              Repairs
            </Button>
          </Link>
        )}
      </div>

      {/* Compact Status Cards */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
        {[
          { key: 'ALL', label: 'Total', count: statusSummary.total, color: 'gray', icon: FileText },
          { key: 'IN_DELIVERY', label: 'Kirim', count: statusSummary.inDelivery, color: 'cyan', icon: Package },
          { key: 'RECEIVED', label: 'Terima', count: statusSummary.received, color: 'blue', icon: Inbox },
          { key: 'IN_PROGRESS', label: 'Repair', count: statusSummary.inProgress, color: 'yellow', icon: Wrench },
          { key: 'RESOLVED', label: 'Selesai', count: statusSummary.resolved, color: 'green', icon: CheckCircle2 },
          { key: 'RETURN_SHIPPED', label: 'Kembali', count: statusSummary.returnShipped, color: 'purple', icon: TruckIcon },
          { key: 'CLOSED', label: 'Tutup', count: statusSummary.closed, color: 'gray', icon: XCircle },
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

      {/* Search & Filter */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari SO number, cassette SN, machine SN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="CRITICAL">Kritis</SelectItem>
                <SelectItem value="HIGH">Tinggi</SelectItem>
                <SelectItem value="MEDIUM">Sedang</SelectItem>
                <SelectItem value="LOW">Rendah</SelectItem>
              </SelectContent>
            </Select>
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
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">SO NUMBER</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">STATUS</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">KASET</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">MESIN</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">REPORTER</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">TANGGAL</th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-700">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p>Tidak ada service order</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => {
                    const statusBadge = getStatusBadge(ticket.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div>
                            <p className="font-mono font-bold text-sm text-gray-900">{ticket.ticketNumber}</p>
                            <p className="text-xs text-gray-600 truncate max-w-[200px]" title={ticket.title}>
                              {ticket.title}
                            </p>
                            <span className={`text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority === 'CRITICAL' ? '🔴' : 
                               ticket.priority === 'HIGH' ? '🟠' : 
                               ticket.priority === 'MEDIUM' ? '🟡' : '🟢'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={`${statusBadge.variant} text-[10px] px-2 py-0.5 gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusBadge.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-purple-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-medium text-gray-900 truncate">
                                {ticket.cassette?.serialNumber || 'N/A'}
                              </p>
                              {ticket.cassette?.cassetteType && (
                                <p className="text-[10px] text-gray-500 truncate">
                                  {ticket.cassette.cassetteType.typeCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            <p className="font-mono text-xs font-medium text-gray-900 truncate max-w-[120px]">
                              {ticket.machine?.serialNumberManufacturer || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            <p className="text-xs text-gray-900 truncate max-w-[120px]">
                              {ticket.reporter?.fullName || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.reportedAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Link href={`/tickets/${ticket.id}`}>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Detail
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
                Halaman {currentPage} dari {totalPages} • Total {filteredTickets.length} SO
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

