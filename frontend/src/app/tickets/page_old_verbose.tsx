'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  TrendingUp,
  Wrench,
  Package,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Truck as TruckIcon,
} from 'lucide-react';

export default function TicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [sortField, setSortField] = useState<string>('reportedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role-based permissions
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

  // Filter, sort, and paginate tickets
  const filteredAndSortedTickets = useMemo(() => {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.ticketNumber?.toLowerCase().includes(search) ||
          ticket.title?.toLowerCase().includes(search) ||
          ticket.description?.toLowerCase().includes(search) ||
          ticket.cassette?.serialNumber?.toLowerCase().includes(search) ||
          ticket.machine?.serialNumberManufacturer?.toLowerCase().includes(search) ||
          ticket.reporter?.fullName?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((ticket) => ticket.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter((ticket) => ticket.priority === selectedPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested fields
      if (sortField === 'cassette') {
        aVal = a.cassette?.serialNumber || '';
        bVal = b.cassette?.serialNumber || '';
      } else if (sortField === 'reporter') {
        aVal = a.reporter?.fullName || '';
        bVal = b.reporter?.fullName || '';
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal instanceof Date || bVal instanceof Date || sortField.includes('At')) {
        const dateA = new Date(aVal).getTime();
        const dateB = new Date(bVal).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return filtered;
  }, [tickets, searchTerm, selectedStatus, selectedPriority, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);
  const paginatedTickets = filteredAndSortedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status summary
  const statusSummary = useMemo(() => {
    return {
      total: tickets.length,
      inDelivery: tickets.filter((t) => t.status === 'IN_DELIVERY').length,
      received: tickets.filter((t) => t.status === 'RECEIVED').length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
      returnShipped: tickets.filter((t) => t.status === 'RETURN_SHIPPED').length,
      closed: tickets.filter((t) => t.status === 'CLOSED').length,
    };
  }, [tickets]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority]);

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-gray-600">Memuat data service orders...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Helper functions for status/priority labels and colors
  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: string; icon: any }> = {
      OPEN: { label: 'Open', variant: 'bg-blue-500 text-white', icon: AlertCircle },
      IN_DELIVERY: { label: 'Dikirim ke RC', variant: 'bg-cyan-500 text-white', icon: Package },
      RECEIVED: { label: 'Diterima di RC', variant: 'bg-blue-600 text-white', icon: Inbox },
      IN_PROGRESS: { label: 'Sedang Diperbaiki', variant: 'bg-yellow-500 text-white', icon: Wrench },
      RESOLVED: { label: 'Selesai Diperbaiki', variant: 'bg-green-500 text-white', icon: CheckCircle2 },
      RETURN_SHIPPED: { label: 'Dikirim ke Vendor', variant: 'bg-purple-500 text-white', icon: TruckIcon },
      CLOSED: { label: 'Selesai', variant: 'bg-gray-500 text-white', icon: XCircle },
    };
    return configs[status] || configs.OPEN;
  };

  const getPriorityBadge = (priority: string) => {
    const configs: Record<string, { label: string; variant: string }> = {
      CRITICAL: { label: 'Kritis', variant: 'bg-red-100 text-red-800 border-red-300' },
      HIGH: { label: 'Tinggi', variant: 'bg-orange-100 text-orange-800 border-orange-300' },
      MEDIUM: { label: 'Sedang', variant: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      LOW: { label: 'Rendah', variant: 'bg-green-100 text-green-800 border-green-300' },
    };
    return configs[priority] || configs.MEDIUM;
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <PageLayout>
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Service Orders
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {isHitachi ? '🏢 Hitachi' : '🔧 Vendor'}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                {isHitachi
                  ? 'Kelola dan proses service orders - Terima kiriman, kelola perbaikan, dan kirim kembali'
                  : 'Lacak dan kelola service orders operasional'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isHitachi && (
              <Link href="/repairs">
                <Button variant="outline" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Repairs
                </Button>
              </Link>
            )}
            {isPengelola && (
              <Link href="/tickets/create">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <AlertCircle className="h-4 w-4" />
                  Buat SO
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <Card className="border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer" onClick={() => setSelectedStatus('ALL')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{statusSummary.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-2 transition-colors cursor-pointer ${selectedStatus === 'IN_DELIVERY' ? 'border-cyan-500 bg-cyan-50' : 'border-cyan-200 hover:border-cyan-300'}`} onClick={() => setSelectedStatus(selectedStatus === 'IN_DELIVERY' ? 'ALL' : 'IN_DELIVERY')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">Dikirim</p>
                <p className="text-2xl font-bold text-cyan-700">{statusSummary.inDelivery}</p>
              </div>
              <Package className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-colors cursor-pointer ${selectedStatus === 'RECEIVED' ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-300'}`} onClick={() => setSelectedStatus(selectedStatus === 'RECEIVED' ? 'ALL' : 'RECEIVED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Diterima</p>
                <p className="text-2xl font-bold text-blue-700">{statusSummary.received}</p>
              </div>
              <Inbox className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-colors cursor-pointer ${selectedStatus === 'IN_PROGRESS' ? 'border-yellow-500 bg-yellow-50' : 'border-yellow-200 hover:border-yellow-300'}`} onClick={() => setSelectedStatus(selectedStatus === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Repair</p>
                <p className="text-2xl font-bold text-yellow-700">{statusSummary.inProgress}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-colors cursor-pointer ${selectedStatus === 'RESOLVED' ? 'border-green-500 bg-green-50' : 'border-green-200 hover:border-green-300'}`} onClick={() => setSelectedStatus(selectedStatus === 'RESOLVED' ? 'ALL' : 'RESOLVED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Selesai</p>
                <p className="text-2xl font-bold text-green-700">{statusSummary.resolved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-colors cursor-pointer ${selectedStatus === 'RETURN_SHIPPED' ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-300'}`} onClick={() => setSelectedStatus(selectedStatus === 'RETURN_SHIPPED' ? 'ALL' : 'RETURN_SHIPPED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Kembali</p>
                <p className="text-2xl font-bold text-purple-700">{statusSummary.returnShipped}</p>
              </div>
              <TruckIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-colors cursor-pointer ${selectedStatus === 'CLOSED' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedStatus(selectedStatus === 'CLOSED' ? 'ALL' : 'CLOSED')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tutup</p>
                <p className="text-2xl font-bold text-gray-700">{statusSummary.closed}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari SO, kaset, mesin, reporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="IN_DELIVERY">Dikirim ke RC</SelectItem>
                <SelectItem value="RECEIVED">Diterima di RC</SelectItem>
                <SelectItem value="IN_PROGRESS">Sedang Diperbaiki</SelectItem>
                <SelectItem value="RESOLVED">Selesai Diperbaiki</SelectItem>
                <SelectItem value="RETURN_SHIPPED">Dikirim ke Vendor</SelectItem>
                <SelectItem value="CLOSED">Selesai</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Prioritas</SelectItem>
                <SelectItem value="CRITICAL">Kritis</SelectItem>
                <SelectItem value="HIGH">Tinggi</SelectItem>
                <SelectItem value="MEDIUM">Sedang</SelectItem>
                <SelectItem value="LOW">Rendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      {filteredAndSortedTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Tidak ada service order ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau pencarian</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-all border-2 border-gray-200 hover:border-blue-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {ticket.ticketNumber}
                      </CardTitle>
                      <Badge className={`${getPriorityBadge(ticket.priority).variant} border`}>
                        {getPriorityBadge(ticket.priority).label}
                      </Badge>
                    </div>
                    <CardDescription className="text-base font-medium text-gray-700">
                      {ticket.title}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {(() => {
                      const statusBadge = getStatusBadge(ticket.status);
                      const StatusIcon = statusBadge.icon;
                      return (
                        <Badge className={`${statusBadge.variant} gap-1 px-3 py-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusBadge.label}
                        </Badge>
                      );
                    })()}
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Description */}
                {ticket.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">{ticket.description}</p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Cassette Info */}
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      KASET
                    </p>
                    <p className="font-mono font-bold text-sm text-purple-900">
                      {ticket.cassette?.serialNumber || 'N/A'}
                    </p>
                    {ticket.cassette?.cassetteType && (
                      <p className="text-xs text-purple-700 mt-1">
                        {ticket.cassette.cassetteType.typeCode}
                        {ticket.cassette.cassetteType.typeName && 
                          ` (${ticket.cassette.cassetteType.typeName})`
                        }
                      </p>
                    )}
                    {ticket.wsid && (
                      <p className="text-xs text-purple-600 mt-1">WSID: {ticket.wsid}</p>
                    )}
                    {ticket.errorCode && (
                      <p className="text-xs text-red-600 mt-1 font-medium">Error: {ticket.errorCode}</p>
                    )}
                  </div>

                  {/* Machine Info */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">MESIN</p>
                    <p className="font-mono font-bold text-sm text-blue-900">
                      {ticket.machine?.serialNumberManufacturer || 'N/A'}
                    </p>
                    {ticket.machine?.machineCode && (
                      <p className="text-xs text-blue-700 mt-1">Code: {ticket.machine.machineCode}</p>
                    )}
                  </div>

                  {/* Reporter & Time Info */}
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-900 mb-2">REPORTER</p>
                    <p className="font-medium text-sm text-gray-900">
                      {ticket.reporter?.fullName || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ticket.reportedAt ? new Date(ticket.reportedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Bank and Resolution Info */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {(ticket.cassette?.customerBank?.bankName || ticket.machine?.customerBank?.bankName) && (
                    <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700">Bank</p>
                      <p className="text-sm font-semibold text-green-900">
                        {ticket.cassette?.customerBank?.bankName || ticket.machine?.customerBank?.bankName}
                      </p>
                    </div>
                  )}
                  {ticket.resolvedAt && (
                    <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700">Resolved</p>
                      <p className="text-sm font-semibold text-green-900">
                        {new Date(ticket.resolvedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {ticket.closedAt && (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-700">Closed</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(ticket.closedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Progress Timeline */}
                <div className="mb-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-3">📊 Status Progress:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* OPEN */}
                    <div className={`flex items-center gap-2 ${ticket.status === 'OPEN' || ticket.status === 'IN_DELIVERY' || ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'OPEN' ? 'bg-blue-600 text-white ring-2 ring-blue-300' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ticket.reportedAt ? `✓ OPEN` : '○ OPEN'}
                      </div>
                      {ticket.status !== 'OPEN' && <span className="text-gray-400">→</span>}
                    </div>

                    {/* IN_DELIVERY */}
                    {(ticket.cassetteDelivery?.shippedDate || ticket.status === 'IN_DELIVERY' || ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                      <div className={`flex items-center gap-2 ${ticket.status === 'IN_DELIVERY' || ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'IN_DELIVERY' ? 'bg-cyan-600 text-white ring-2 ring-cyan-300' :
                          'bg-cyan-100 text-cyan-800'
                        }`}>
                          {ticket.cassetteDelivery?.shippedDate ? `✓ IN_DELIVERY` : '○ IN_DELIVERY'}
                        </div>
                        {ticket.status !== 'IN_DELIVERY' && ticket.status !== 'OPEN' && <span className="text-gray-400">→</span>}
                      </div>
                    )}

                    {/* IN_PROGRESS */}
                    {(ticket.cassetteDelivery?.receivedAtRc || ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                      <div className={`flex items-center gap-2 ${ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'IN_PROGRESS' ? 'bg-yellow-600 text-white ring-2 ring-yellow-300' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ticket.cassetteDelivery?.receivedAtRc ? `✓ IN_PROGRESS` : '○ IN_PROGRESS'}
                        </div>
                        {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'IN_DELIVERY' && ticket.status !== 'OPEN' && <span className="text-gray-400">→</span>}
                      </div>
                    )}

                    {/* RESOLVED */}
                    {(ticket.resolvedAt || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
                      <div className={`flex items-center gap-2 ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'RESOLVED' ? 'bg-green-600 text-white ring-2 ring-green-300' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.resolvedAt ? `✓ RESOLVED` : '○ RESOLVED'}
                        </div>
                        {ticket.status === 'CLOSED' && <span className="text-gray-400">→</span>}
                      </div>
                    )}

                    {/* CLOSED */}
                    {ticket.closedAt && (
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'CLOSED' ? 'bg-gray-600 text-white ring-2 ring-gray-300' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          ✓ CLOSED
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* RC Staff Actions */}
                {isHitachi && (
                  <div className="pt-4 border-t space-y-2">
                    {ticket.status === 'OPEN' && !ticket.cassetteDelivery && (
                      <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="font-medium">⏳ Menunggu delivery dari vendor...</p>
                        <p className="text-xs mt-1 text-amber-700">
                          Ticket akan otomatis menjadi <strong>IN_DELIVERY</strong> setelah vendor mengirim kaset dengan info delivery (kurir + tracking number).
                        </p>
                      </div>
                    )}
                    {ticket.status === 'IN_DELIVERY' && ticket.cassetteDelivery && !ticket.cassetteDelivery.receivedAtRc && (
                      <div className="space-y-2">
                        <div className="text-sm text-cyan-600 bg-cyan-50 border border-cyan-200 rounded-md p-3">
                          <p className="font-medium">📦 Kaset sedang dalam perjalanan ke Repair Center</p>
                          {ticket.cassetteDelivery.courierService && (
                            <p className="text-xs mt-1 text-cyan-700">
                              Kurir: <strong>{ticket.cassetteDelivery.courierService}</strong>
                              {ticket.cassetteDelivery.trackingNumber && (
                                <> | Resi: <strong>{ticket.cassetteDelivery.trackingNumber}</strong></>
                              )}
                            </p>
                          )}
                          {ticket.cassetteDelivery.shippedDate && (
                            <p className="text-xs mt-1 text-cyan-700">
                              Dikirim: {new Date(ticket.cassetteDelivery.shippedDate).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                        <Link href={`/tickets/${ticket.id}/receive`}>
                          <Button size="sm" className="w-full bg-cyan-600 hover:bg-cyan-700">✅ Terima Kaset di RC</Button>
                        </Link>
                      </div>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          🔧 Kaset sedang diperbaiki. Kelola di halaman Repairs.
                        </p>
                        {ticket.cassette?.repairTickets && ticket.cassette.repairTickets.length > 0 ? (
                          <Link href={`/repairs/${ticket.cassette.repairTickets[0].id}`}>
                            <Button size="sm" variant="outline" className="w-full">
                              Kelola Repair Ticket
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/repairs">
                            <Button size="sm" variant="outline" className="w-full">
                              Lihat Repair Tickets
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                    {ticket.status === 'RESOLVED' && !ticket.cassetteReturn && (
                      <Link href={`/tickets/${ticket.id}/return`}>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          📦 Kirim Kembali ke Vendor
                        </Button>
                      </Link>
                    )}
                    {ticket.status === 'CLOSED' && (
                      <div className="text-sm text-green-600">
                        ✅ Ticket sudah selesai dan ditutup.
                      </div>
                    )}
                  </div>
                )}
                {ticket.status === 'RESOLVED' && isPengelola && ticket.cassetteReturn && !ticket.cassetteReturn.receivedAtPengelola && (
                  <div className="pt-4 border-t">
                    <Link href={`/tickets/${ticket.id}/receive-return`}>
                      <Button size="sm" variant="outline">Terima Kaset Kembali</Button>
                    </Link>
                  </div>
                )}
                {ticket.cassetteDelivery && (
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm font-medium mb-2">Delivery Info (Vendor → RC):</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Cassette: {ticket.cassetteDelivery.cassette?.serialNumber}</p>
                      <p>Shipped: {formatDateTime(ticket.cassetteDelivery.shippedDate)}</p>
                      {ticket.cassetteDelivery.courierService && (
                        <p>Courier: {ticket.cassetteDelivery.courierService}</p>
                      )}
                      {ticket.cassetteDelivery.trackingNumber && (
                        <p>Tracking: {ticket.cassetteDelivery.trackingNumber}</p>
                      )}
                      {ticket.cassetteDelivery.receivedAtRc && (
                        <p className="text-green-600">✅ Received at RC: {formatDateTime(ticket.cassetteDelivery.receivedAtRc)}</p>
                      )}
                    </div>
                  </div>
                )}
                {ticket.cassette?.repairTickets && ticket.cassette.repairTickets.length > 0 && isHitachi && (
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm font-medium mb-2">Repair Ticket:</p>
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      {ticket.cassette.repairTickets[0].status && (
                        <p>Status: <span className="font-medium">{ticket.cassette.repairTickets[0].status}</span></p>
                      )}
                      {ticket.cassette.repairTickets[0].qcPassed !== null && (
                        <p>QC: {ticket.cassette.repairTickets[0].qcPassed ? '✅ Passed' : '❌ Failed'}</p>
                      )}
                    </div>
                    <Link href={`/repairs/${ticket.cassette.repairTickets[0].id}`}>
                      <Button size="sm" variant="outline">
                        View Repair Details
                      </Button>
                    </Link>
                  </div>
                )}
                {ticket.cassetteReturn && (
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm font-medium mb-2">Return Info (RC → Vendor):</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Cassette: {ticket.cassetteReturn.cassette?.serialNumber}</p>
                      <p>Shipped: {formatDateTime(ticket.cassetteReturn.shippedDate)}</p>
                      {ticket.cassetteReturn.courierService && (
                        <p>Courier: {ticket.cassetteReturn.courierService}</p>
                      )}
                      {ticket.cassetteReturn.trackingNumber && (
                        <p>Tracking: {ticket.cassetteReturn.trackingNumber}</p>
                      )}
                      {ticket.cassetteReturn.receivedAtVendor && (
                        <p className="text-green-600">✅ Received at Vendor: {formatDateTime(ticket.cassetteReturn.receivedAtVendor)}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedTickets.length)} dari{' '}
                    {filteredAndSortedTickets.length} SO
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, current, and nearby pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
}

