'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { markTicketAsViewed } from '@/lib/viewed-tickets';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Wrench,
  Truck,
  FileText,
  User,
  Building2,
  Monitor,
  ArrowLeft,
  XCircle,
  Inbox,
  Truck as TruckIcon,
  Trash2,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const ticketId = params.id as string;
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingRepairs, setCreatingRepairs] = useState(false);
  const [showPickupDialog, setShowPickupDialog] = useState(false);
  const [pickupNotes, setPickupNotes] = useState('');
  const [confirmingPickup, setConfirmingPickup] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [receiveNotes, setReceiveNotes] = useState('');
  const [receiving, setReceiving] = useState(false);

  const isHitachi = user?.userType === 'HITACHI';
  const isPengelola = user?.userType === 'PENGELOLA';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isRcManager = user?.role === 'RC_MANAGER';
  
  // Only Hitachi users can delete tickets
  // Only SUPER_ADMIN can delete CLOSED tickets
  // RC_MANAGER and SUPER_ADMIN can delete non-CLOSED tickets
  // RC_STAFF cannot delete tickets
  const canDelete = isHitachi && (
    isSuperAdmin || 
    (isRcManager && ticket?.status !== 'CLOSED')
  );

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
      try {
        // Fetch ticket
        const ticketResponse = await api.get(`/tickets/${ticketId}`);
        const ticketData = ticketResponse.data;
        setTicket(ticketData);
        
        // Debug: Log ticket data to help troubleshoot
        console.log('Ticket data:', {
          id: ticketData?.id,
          status: ticketData?.status,
          deliveryMethod: ticketData?.deliveryMethod,
          hasCassetteDelivery: !!ticketData?.cassetteDelivery,
          courierService: ticketData?.cassetteDelivery?.courierService,
          receivedAtRc: ticketData?.cassetteDelivery?.receivedAtRc,
          userType: user?.userType,
          isHitachi: user?.userType === 'HITACHI',
          canShowReceiveButton: (ticketData?.cassetteDelivery && !ticketData?.cassetteDelivery?.receivedAtRc) || 
                                 (ticketData?.deliveryMethod === 'SELF_DELIVERY' && !ticketData?.cassetteDelivery && 
                                  (ticketData?.status === 'OPEN' || ticketData?.status === 'IN_DELIVERY')),
          // Debug for "Mulai Repair" button
          canShowStartRepair: ticketData?.status === 'RECEIVED' && 
                              !ticketData?.cassetteDetails?.some((detail: any) => detail.requestReplacement === true),
          hasRequestReplacement: ticketData?.cassetteDetails?.some((detail: any) => detail.requestReplacement === true),
          cassetteDetailsCount: ticketData?.cassetteDetails?.length || 0,
          cassetteDetails: ticketData?.cassetteDetails?.map((d: any) => ({ 
            id: d.id, 
            requestReplacement: d.requestReplacement,
            cassetteId: d.cassetteId 
          })) || [],
        });
        
        // Mark ticket as viewed if it's a new ticket (OPEN or IN_DELIVERY status)
        if (ticketData && (ticketData.status === 'OPEN' || ticketData.status === 'IN_DELIVERY')) {
          markTicketAsViewed(ticketId);
        }

        // Get all cassettes for this ticket
        const allCassettes = ticketResponse.data.cassetteDetails && ticketResponse.data.cassetteDetails.length > 0
          ? ticketResponse.data.cassetteDetails.map((detail: any) => detail.cassette).filter((c: any) => c !== null)
          : (ticketResponse.data.cassette ? [ticketResponse.data.cassette] : []);
        
        const cassetteIds = allCassettes.map((c: any) => c.id);

        // Fetch repairs if user is Hitachi - use optimized endpoint
        if (isAuthenticated && user?.userType === 'HITACHI') {
          try {
            const repairsResponse = await api.get(`/repairs/by-ticket/${ticketId}`);
            setRepairs(repairsResponse.data || []);
          } catch (repairError) {
            console.warn('Could not fetch repairs:', repairError);
            setRepairs([]);
          }
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && ticketId) {
      fetchData();
    }
  }, [isAuthenticated, ticketId, user?.userType]);

  const getStatusBadge = (status: string) => {
    // UI status labels disesuaikan dengan flow baru (pickup di RC, tanpa pengiriman balik)
    const configs: Record<string, { label: string; variant: string; icon: any }> = {
      OPEN: { label: 'Open', variant: 'bg-[#2563EB] text-white', icon: AlertCircle },
      IN_DELIVERY: { label: 'Dalam Pengiriman ke RC', variant: 'bg-amber-500 text-white', icon: Package },
      RECEIVED: { label: 'Diterima di RC', variant: 'bg-sky-600 text-white', icon: Inbox },
      IN_PROGRESS: { label: 'Sedang Diperbaiki', variant: 'bg-yellow-500 text-white', icon: Wrench },
      RESOLVED: { label: 'Siap Di-pickup di RC', variant: 'bg-green-600 text-white', icon: CheckCircle2 },
      // RETURN_SHIPPED disimpan untuk kompatibilitas backend, tetapi di flow baru tidak digunakan
      RETURN_SHIPPED: { label: 'Tahap Pengembalian (Legacy)', variant: 'bg-slate-500 text-white', icon: TruckIcon },
      CLOSED: { label: 'Selesai', variant: 'bg-gray-600 text-white', icon: XCircle },
    };
    return configs[status] || configs.OPEN;
  };

  const getPriorityBadge = (priority: string) => {
    const configs: Record<string, { label: string; variant: string }> = {
      CRITICAL: { label: 'Kritis', variant: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' },
      HIGH: { label: 'Tinggi', variant: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
      MEDIUM: { label: 'Sedang', variant: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' },
      LOW: { label: 'Rendah', variant: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700' },
    };
    return configs[priority] || configs.MEDIUM;
  };

  const getRepairStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: string; icon: any }> = {
      RECEIVED: { label: 'Received', variant: 'bg-blue-500 text-white', icon: Package },
      DIAGNOSING: { label: 'Diagnosing', variant: 'bg-yellow-500 text-white', icon: AlertCircle },
      ON_PROGRESS: { label: 'On Progress', variant: 'bg-orange-500 text-white', icon: Wrench },
      COMPLETED: { label: 'Completed', variant: 'bg-green-500 text-white', icon: CheckCircle2 },
    };
    return configs[status] || { label: status, variant: 'bg-gray-500 text-white', icon: FileText };
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tickets/${ticketId}`);
      alert('Service Order berhasil dihapus. Status cassette telah dikembalikan ke OK.');
      router.push('/tickets');
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      alert(error.response?.data?.message || 'Gagal menghapus Service Order');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleConfirmPickup = async () => {
    setConfirmingPickup(true);
    try {
      await api.post('/tickets/return', {
        ticketId: ticketId,
        notes: pickupNotes.trim() || undefined,
      });
      
      toast({
        title: 'Berhasil',
        description: 'Pickup berhasil dikonfirmasi. Status kaset langsung berubah menjadi OK.',
      });
      
      setShowPickupDialog(false);
      setPickupNotes('');
      
      // Refresh ticket data
      const response = await api.get(`/tickets/${ticketId}`);
      setTicket(response.data);
    } catch (error: any) {
      console.error('Error confirming pickup:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal mengonfirmasi pickup',
        variant: 'destructive',
      });
    } finally {
      setConfirmingPickup(false);
    }
  };

  const handleReceiveDelivery = async () => {
    setReceiving(true);
    try {
      await api.post(`/tickets/${ticketId}/receive-delivery`, {
        notes: receiveNotes.trim() || undefined,
      });
      
      toast({
        title: 'Berhasil',
        description: isMultiCassette 
          ? `${cassetteCount} kaset berhasil diterima di RC. Status ticket berubah menjadi RECEIVED.`
          : 'Kaset berhasil diterima di RC. Status ticket berubah menjadi RECEIVED.',
      });
      
      setShowReceiveDialog(false);
      setReceiveNotes('');
      
      // Refresh ticket data
      const response = await api.get(`/tickets/${ticketId}`);
      setTicket(response.data);
    } catch (error: any) {
      console.error('Error receiving delivery:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal menerima kaset',
        variant: 'destructive',
      });
    } finally {
      setReceiving(false);
    }
  };

  const handleStartRepair = async () => {
    if (!confirm(isMultiCassette 
      ? `Mulai repair untuk ${cassetteCount} kaset?\n\nIni akan membuat ${cassetteCount} repair tickets dan mengubah status SO menjadi IN_PROGRESS.`
      : 'Mulai repair untuk kaset ini?\n\nIni akan membuat repair ticket dan mengubah status SO menjadi IN_PROGRESS.'
    )) {
      return;
    }

    setCreatingRepairs(true);
    try {
      const response = await api.post(`/repairs/bulk-from-ticket/${ticketId}`);
      
      toast({
        title: 'Berhasil!',
        description: `${response.data.count} repair ticket telah dibuat. Silakan lihat di halaman Repairs untuk mengelola repair.`,
        variant: 'default',
      });
      
      // Refresh ticket data
      const ticketResponse = await api.get(`/tickets/${ticketId}`);
      setTicket(ticketResponse.data);

      // Refresh repairs data - use optimized endpoint
      if (isHitachi) {
        try {
          const repairsResponse = await api.get(`/repairs/by-ticket/${ticketId}`);
          setRepairs(repairsResponse.data || []);
        } catch (repairError) {
          console.warn('Could not refresh repairs:', repairError);
        }
      }
    } catch (error: any) {
      console.error('Error creating repairs:', error);
      toast({
        title: 'Gagal Membuat Repair Tickets',
        description: error.response?.data?.message || 'Terjadi kesalahan saat membuat repair tickets. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setCreatingRepairs(false);
    }
  };

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#2563EB] dark:text-teal-400" />
            <p className="text-lg font-medium text-gray-600 dark:text-slate-300">Memuat detail SO...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated || !ticket) {
    return null;
  }

  // Effective status untuk UI:
  // Jika semua repair sudah COMPLETED (dan ini bukan replacement ticket),
  // anggap status SO = RESOLVED (Ready to Pickup) walaupun backend
  // mungkin masih IN_PROGRESS karena delay sinkronisasi.
  const allCassettes = ticket.cassetteDetails && ticket.cassetteDetails.length > 0
    ? ticket.cassetteDetails.map((detail: any) => detail.cassette)
    : [ticket.cassette].filter(Boolean);

  const cassetteCount = allCassettes.length;
  const isMultiCassette = cassetteCount > 1;

  // Check if this is a replacement ticket (no repair tickets needed)
  const isReplacementTicket = ticket.requestReplacement === true || 
    ticket.cassetteDetails?.some((detail: any) => detail.requestReplacement === true);

  // Check if all repair tickets are completed (only for non-replacement tickets)
  const completedRepairs = repairs.filter((r: any) => r.status === 'COMPLETED');
  const completedCount = completedRepairs.length;
  const allRepairsCompleted = repairs.length > 0 && repairs.length === cassetteCount && 
    repairs.every((r: any) => r.status === 'COMPLETED');
  
  // Effective status untuk keperluan UI (progress bar + cards)
  const effectiveStatus =
    !isReplacementTicket && allRepairsCompleted && ticket.status !== 'CLOSED'
      ? 'RESOLVED'
      : ticket.status;

  const statusBadge = getStatusBadge(effectiveStatus);
  const priorityBadge = getPriorityBadge(ticket.priority);
  const StatusIcon = statusBadge.icon;

  // Status flow UI (flow baru, pickup-based):
  // OPEN → IN_DELIVERY → RECEIVED → IN_PROGRESS → RESOLVED (ready to pickup) → CLOSED
  const statusSteps = ['OPEN', 'IN_DELIVERY', 'RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const currentStepIndex = statusSteps.indexOf(effectiveStatus);
  
  // Handle case where status is not in steps (shouldn't happen, but safety check)
  const validStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  // For replacement tickets: only check if status is RESOLVED (replacement already done)
  // For repair tickets: check if effectiveStatus is RESOLVED (which already considers allRepairsCompleted)
  // Use effectiveStatus instead of ticket.status to handle cases where backend hasn't synced yet
  // Flow baru: pickup-based (Pengelola pickup di RC), bukan shipping-based
  const canConfirmPickup = effectiveStatus === 'RESOLVED' && 
    (isReplacementTicket || allRepairsCompleted) &&
    !ticket.cassetteReturn;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
            className="mb-4 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        </div>

        {/* Header Card - Compact */}
        <div className="mb-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-[#1e293b] dark:to-[#0f172a] rounded-xl p-4 shadow-lg border border-slate-300 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{ticket.ticketNumber || `Ticket ${ticketId}`}</h1>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-medium mt-0.5">{ticket.title || 'No title'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className={`${statusBadge.variant} text-xs px-2.5 py-1 font-bold`}>
                  <StatusIcon className="h-3.5 w-3.5 mr-1" />
                {statusBadge.label}
              </Badge>
                <Badge className={`${priorityBadge.variant} border text-xs px-2.5 py-1 font-bold`}>
                {priorityBadge.label}
              </Badge>
                
                {/* Cassette Count Badge */}
                {cassetteCount > 0 && (
                  <div className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded border-2 border-teal-500 dark:border-teal-500/50">
                    <div className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                        {cassetteCount} {cassetteCount > 1 ? 'Kaset' : 'Kaset'}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

            {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="self-start font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Hapus
            </Button>
          )}
        </div>
      </div>

        {/* Progress Tracker - Compact */}
        <div className="mb-3 bg-slate-100 dark:bg-[#1e293b] rounded-lg p-3 shadow-md border border-slate-300 dark:border-slate-700">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
            <Truck className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" />
            Progress Service Order
          </h3>
          <div className="relative">
            <div className="flex justify-between items-start">
              {statusSteps.map((status, index) => {
                const isActive = validStepIndex === index;
                const isPassed = validStepIndex > index;
                // Ikon per langkah disesuaikan dengan 6 step flow baru
                const stepIcons = [FileText, Package, Inbox, Wrench, CheckCircle2, XCircle];
                const StepIcon = stepIcons[index] || FileText;
                
                return (
                  <div key={status} className="flex flex-col items-center flex-1 relative">
                    {/* Connection Line */}
                    {index < statusSteps.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-0.5 -z-10">
                        <div className={`h-full transition-all ${
                          isPassed ? 'bg-teal-500 dark:bg-teal-400' : 'bg-slate-300 dark:bg-slate-600'
                        }`} />
                      </div>
                    )}
                    
                    {/* Step Circle */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 mb-1
                      ${isActive 
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-600 shadow-md shadow-teal-500/50 scale-105' 
                        : isPassed 
                        ? 'bg-teal-500 dark:bg-teal-500' 
                        : 'bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600'
                      }
                    `}>
                      {isPassed && !isActive ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <StepIcon className={`h-3.5 w-3.5 ${isActive || isPassed ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <span className={`text-[10px] text-center font-semibold max-w-[60px] leading-tight transition-all
                      ${isActive ? 'text-teal-600 dark:text-teal-200' : isPassed ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}
                    `}>
                      {status === 'OPEN' ? 'Buat SO' :
                       status === 'IN_DELIVERY' ? 'Kirim RC' :
                       status === 'RECEIVED' ? 'Terima RC' :
                       status === 'IN_PROGRESS' ? 'Repair' :
                       status === 'RESOLVED' ? 'Selesai' :
                       status === 'RETURN_SHIPPED' ? 'Kirim' : 'Tutup'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Cards - 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Info Grid */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  Informasi Ticket
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <InfoBlock icon={Package} iconColor="text-teal-500 dark:text-teal-400" title={isMultiCassette ? `KASET (${cassetteCount})` : "KASET"}>
                  {isMultiCassette ? (
                    <div className="space-y-1">
                      {allCassettes.slice(0, 2).map((cassette: any, idx: number) => (
                        <div key={cassette.id}>
                            <InfoItem label={`#${idx + 1}`} value={cassette.serialNumber} mono />
                        </div>
                      ))}
                      {cassetteCount > 2 && (
                          <p className="text-[10px] text-teal-500 dark:text-teal-400 font-medium">+{cassetteCount - 2} lagi</p>
                      )}
                    </div>
                  ) : (
                    <>
                        <InfoItem label="SN" value={ticket.cassette?.serialNumber || 'N/A'} mono />
                      {ticket.cassette?.cassetteType && (
                          <InfoItem label="Tipe" value={ticket.cassette.cassetteType.typeCode} />
                      )}
                    </>
                  )}
                </InfoBlock>

                {ticket.machine && (
                    <InfoBlock icon={Monitor} iconColor="text-blue-500 dark:text-blue-400" title="MESIN">
                      <InfoItem label="SN" value={ticket.machine.serialNumberManufacturer} mono />
                    {ticket.machine.customerBank && (
                        <InfoItem label="Bank" value={ticket.machine.customerBank.bankName} />
                    )}
                  </InfoBlock>
                )}

                  <InfoBlock icon={User} iconColor="text-orange-500 dark:text-orange-400" title="REPORTER">
                    <InfoItem label="Nama" value={ticket.reporter?.fullName || 'N/A'} />
                  {ticket.reporter?.pengelola && (
                      <InfoItem label="Pengelola" value={ticket.reporter.pengelola.companyName} />
                  )}
                </InfoBlock>

                  <InfoBlock icon={Clock} iconColor="text-gray-500 dark:text-gray-400" title="WAKTU">
                    <InfoItem label="Dibuat" value={formatDateTime(ticket.reportedAt).split(',')[0]} />
                  {ticket.errorCode && (
                      <InfoItem label="Error" value={ticket.errorCode} valueClass="text-red-500 dark:text-red-400" />
                  )}
                </InfoBlock>
              </div>

              {ticket.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-700 dark:text-slate-300 font-extrabold mb-2 uppercase tracking-wider">DESKRIPSI</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100 leading-relaxed font-medium">{ticket.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

            {/* Multi-Cassette Detail List - Compact Table */}
          {isMultiCassette && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">Detail Semua Kaset</h3>
                  </div>
                    <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm px-3 py-1 font-bold">
                    {cassetteCount} Items
                  </Badge>
                </div>
                  
                  {/* Compact Table View */}
                  <div className="max-h-[600px] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {allCassettes.map((cassette: any, index: number) => (
                        <div key={cassette.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-colors">
                          {/* Number Badge */}
                          <div className="w-7 h-7 rounded bg-teal-600 dark:bg-teal-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                        {index + 1}
                      </div>
                          
                          {/* Content */}
                      <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-mono font-extrabold text-sm text-gray-900 dark:text-slate-100 truncate" title={cassette.serialNumber}>
                                {cassette.serialNumber}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                          {cassette.cassetteType && (
                                <>
                                  <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold uppercase tracking-wide">
                              {cassette.cassetteType.typeCode}
                                  </span>
                                  {cassette.cassetteType.machineType && (
                                    <span className={`px-1.5 py-0.5 text-white rounded font-bold uppercase tracking-wide ${
                                      cassette.cassetteType.machineType === 'VS' ? 'bg-purple-600' : 'bg-orange-600'
                                    }`}>
                                      {cassette.cassetteType.machineType}
                            </span>
                                  )}
                                </>
                          )}
                          {cassette.customerBank && (
                                <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                              {cassette.customerBank.bankName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery/Return Info */}
          {(ticket.cassetteDelivery || ticket.cassetteReturn) && (
              <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                  {ticket.cassetteDelivery && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-500/50 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold mb-4">
                          <Truck className="h-5 w-5" />
                          <span className="text-sm uppercase tracking-wider">Pengiriman ke RC</span>
                      </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <InfoItem label="Kurir" value={ticket.cassetteDelivery.courierService || 'N/A'} isDark={false} />
                          <InfoItem label="Resi" value={ticket.cassetteDelivery.trackingNumber || 'N/A'} mono isDark={false} />
                          <InfoItem 
                            label="Tanggal Kirim" 
                            value={formatDateTime(ticket.cassetteDelivery.shippedDate).split(',')[0]} 
                            isDark={false} 
                          />
                          <InfoItem 
                            label="Diterima di RC" 
                            value={ticket.cassetteDelivery.receivedAtRc 
                              ? formatDateTime(ticket.cassetteDelivery.receivedAtRc).split(',')[0]
                              : '-'}
                            valueClass={ticket.cassetteDelivery.receivedAtRc 
                              ? '' 
                              : 'text-slate-500 dark:text-slate-500'}
                            isDark={false} 
                          />
                      </div>
                    </div>
                  )}

                  {ticket.cassetteReturn && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-500/50 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-4">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm uppercase tracking-wider">Pickup di RC</span>
                      </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <InfoItem 
                            label="Tanggal Pickup" 
                            value={ticket.cassetteReturn.shippedDate 
                              ? formatDateTime(ticket.cassetteReturn.shippedDate).split(',')[0]
                              : '-'} 
                            isDark={false} 
                          />
                          <InfoItem 
                            label="Dikonfirmasi oleh RC" 
                            value={ticket.cassetteReturn.receivedAtPengelola 
                              ? formatDateTime(ticket.cassetteReturn.receivedAtPengelola).split(',')[0]
                              : '-'}
                            valueClass={ticket.cassetteReturn.receivedAtPengelola 
                              ? '' 
                              : 'text-slate-500 dark:text-slate-500'}
                            isDark={false} 
                          />
                          {ticket.cassetteReturn.notes && (
                            <InfoItem 
                              label="Catatan" 
                              value={ticket.cassetteReturn.notes}
                              isDark={false} 
                            />
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {/* Hitachi Actions */}
          {isHitachi && (
            <>
              {/* Receive Delivery - Show if has cassetteDelivery and not yet received, OR if SELF_DELIVERY without delivery record */}
              {/* Show for both IN_DELIVERY (courier) and OPEN/IN_DELIVERY (self-delivery) status */}
              {((ticket.cassetteDelivery && !ticket.cassetteDelivery.receivedAtRc) || 
                (ticket.deliveryMethod === 'SELF_DELIVERY' && !ticket.cassetteDelivery && (ticket.status === 'OPEN' || ticket.status === 'IN_DELIVERY'))) && 
               (ticket.status === 'IN_DELIVERY' || ticket.status === 'OPEN') && (
                <ActionCard color="cyan">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                      <Package className="h-5 w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {(ticket.cassetteDelivery?.courierService === 'SELF_DELIVERY' || ticket.deliveryMethod === 'SELF_DELIVERY')
                          ? (isMultiCassette ? `${cassetteCount} kaset - Antar Mandiri` : 'Kaset - Antar Mandiri')
                          : (isMultiCassette ? `${cassetteCount} kaset dalam pengiriman` : 'Kaset dalam pengiriman ke RC')}
                      </span>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-300 dark:border-cyan-500/50 rounded p-3">
                      <p className="text-xs text-cyan-800 dark:text-cyan-300">
                        📦 {(ticket.cassetteDelivery?.courierService === 'SELF_DELIVERY' || ticket.deliveryMethod === 'SELF_DELIVERY')
                          ? 'Kaset diantar langsung oleh pengelola. Konfirmasi penerimaan kaset di RC sebelum mulai diagnosa/repair.'
                          : ticket.status === 'IN_DELIVERY' 
                          ? 'Kaset sedang dikirim ke RC. Konfirmasi penerimaan setelah kaset tiba di RC sebelum mulai diagnosa/repair.'
                          : 'Kaset perlu dikonfirmasi penerimaannya di RC sebelum mulai diagnosa/repair.'}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowReceiveDialog(true)}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800 text-white font-semibold" 
                      size="lg"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      {isMultiCassette ? `Terima ${cassetteCount} Kaset di RC` : 'Terima di RC'}
                    </Button>
                  </div>
                </ActionCard>
              )}

              {/* Replacement Request Action - Show for tickets with requestReplacement = true */}
              {ticket.cassetteDetails?.some((detail: any) => detail.requestReplacement === true) && 
               (effectiveStatus === 'RECEIVED' || effectiveStatus === 'IN_PROGRESS') && 
               isHitachi && (
                <ActionCard color="orange">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <RefreshCw className="h-5 w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Replacement Request
                      </span>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-500/50 rounded p-3">
                      <p className="text-xs text-orange-800 dark:text-orange-300">
                        ⚠️ Kaset ini diminta untuk diganti (tidak layak pakai). <strong>TIDAK perlu repair ticket.</strong> Langsung input form replacement untuk ganti SN.
                      </p>
                    </div>
                    <Link href={`/tickets/${ticket.id}/replacement`} className="w-full block">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white font-semibold" size="lg">
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Input Form Replacement
                      </Button>
                    </Link>
                  </div>
                </ActionCard>
              )}

              {/* Show "Mulai Repair" button only if NOT a replacement request */}
              {effectiveStatus === 'RECEIVED' && 
               !ticket.cassetteDetails?.some((detail: any) => detail.requestReplacement === true) && (
                <ActionCard color="teal">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                      <Inbox className="h-5 w-5" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {isMultiCassette ? `${cassetteCount} kaset sudah diterima` : 'Kaset sudah diterima di RC'}
                      </span>
                    </div>
                    <Button 
                      onClick={handleStartRepair}
                      disabled={creatingRepairs}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800 text-white font-bold"
                      size="lg"
                    >
                      {creatingRepairs ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          <span className="font-bold">Memproses...</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="h-5 w-5 mr-2" />
                          <span className="font-bold">{isMultiCassette ? `Mulai Repair ${cassetteCount} Kaset` : 'Mulai Repair'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </ActionCard>
              )}

              {effectiveStatus === 'IN_PROGRESS' && !allRepairsCompleted && (
                <ActionCard color="yellow">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <Wrench className="h-5 w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isMultiCassette ? `${cassetteCount} kaset sedang repair` : 'Sedang diperbaiki'}
                      </span>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/50 rounded p-3">
                      <p className="text-xs text-yellow-800 dark:text-yellow-300">
                        🔧 Repair sedang berlangsung. Cek progress di Repairs page.
                      </p>
                    </div>
                    <Link href="/repairs" className="w-full block">
                      <Button className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold">
                        Lihat Progress Repairs
                      </Button>
                    </Link>
                  </div>
                </ActionCard>
              )}

              {effectiveStatus === 'RESOLVED' && !ticket.cassetteReturn && (
                <ActionCard color="green">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isReplacementTicket 
                          ? (ticket.status === 'RESOLVED' ? 'Replacement selesai' : 'Replacement dalam proses')
                          : (allRepairsCompleted 
                            ? (isMultiCassette ? `${cassetteCount} kaset selesai diperbaiki` : 'Kaset selesai diperbaiki')
                            : (isMultiCassette ? `${completedCount}/${cassetteCount} kaset selesai diperbaiki` : 'Kaset sedang diperbaiki')
                          )
                        }
                      </span>
                    </div>
                    {isReplacementTicket ? (
                      ticket.status === 'RESOLVED' ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-500/50 rounded p-3">
                          <p className="text-xs text-green-800 dark:text-green-300">
                            ✅ Replacement selesai. Kaset baru siap untuk di-pickup oleh Pengelola di RC.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/50 rounded p-3">
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">
                            ⏳ Menunggu proses replacement selesai. Setelah replacement, status akan menjadi RESOLVED dan tombol akan aktif.
                          </p>
                        </div>
                      )
                    ) : allRepairsCompleted ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-500/50 rounded p-3">
                        <p className="text-xs text-green-800 dark:text-green-300">
                        ✅ Repair & QC selesai. Siap untuk di-pickup oleh Pengelola di RC.
                      </p>
                    </div>
                    ) : (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/50 rounded p-3">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          ⏳ Menunggu semua {cassetteCount} kaset selesai diperbaiki ({completedCount}/{cassetteCount} selesai). Tombol akan aktif setelah semua repair tickets selesai.
                        </p>
                      </div>
                    )}
                    {canConfirmPickup ? (
                      <Button 
                        onClick={() => setShowPickupDialog(true)}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800 text-white font-semibold" 
                        size="lg"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        {isMultiCassette ? `Konfirmasi Pickup ${cassetteCount} Kaset` : 'Konfirmasi Pickup'}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 text-white font-semibold cursor-not-allowed opacity-60" 
                        size="lg"
                        disabled
                      >
                        <Package className="h-5 w-5 mr-2" />
                        {isMultiCassette ? `Konfirmasi Pickup ${cassetteCount} Kaset` : 'Konfirmasi Pickup'}
                      </Button>
                    )}
                  </div>
                </ActionCard>
              )}

              {ticket.status === 'RETURN_SHIPPED' && ticket.cassetteReturn && !ticket.cassetteReturn.receivedAtPengelola && (
                <ActionCard color="cyan">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                      <TruckIcon className="h-5 w-5" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isMultiCassette ? `${cassetteCount} kaset dikirim` : 'Kaset dalam pengiriman'}
                      </span>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-300 dark:border-cyan-500/50 rounded p-3">
                      <p className="text-xs text-cyan-800 dark:text-cyan-300">
                        📦 Kaset sedang dikirim kembali ke pengelola. Menunggu konfirmasi penerimaan.
                      </p>
                    </div>
                  </div>
                </ActionCard>
              )}

              {ticket.status === 'CLOSED' && (
                <ActionCard color="green">
                  <div className="space-y-3 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto" />
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">SO Selesai</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Service Order telah selesai dan ditutup.
                      {isMultiCassette && ` ${cassetteCount} kaset telah kembali ke pengelola.`}
                    </p>
                  </div>
                </ActionCard>
              )}
            </>
          )}

          {/* Repair Tickets Status - Grouped by SO */}
          {repairs.length > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Status Repair Semua Kaset</h3>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold px-3 py-1">
                    {repairs.length} Repair Ticket{repairs.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {repairs.map((repair: any) => {
                    const repairStatusBadge = getRepairStatusBadge(repair.status);
                    const RepairStatusIcon = repairStatusBadge.icon;
                    
                    return (
                      <Link 
                        key={repair.id} 
                        href={`/repairs/${repair.id}`}
                        className="block"
                      >
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left: Cassette Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center text-sm font-extrabold shadow-md flex-shrink-0">
                                  {allCassettes.findIndex((c: any) => c.id === repair.cassetteId) + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                                    {repair.cassette?.serialNumber || 'N/A'}
                                  </p>
                                  {repair.cassette?.cassetteType && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                                      {repair.cassette.cassetteType.typeCode}
                                      {repair.cassette.cassetteType.machineType && ` • ${repair.cassette.cassetteType.machineType}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Issue */}
                              {repair.reportedIssue && (
                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-2 line-clamp-2">
                                  {repair.reportedIssue}
                                </p>
                              )}

                              {/* Engineer */}
                              {repair.repairer && (
                                <div className="flex items-center gap-1.5 mt-2 text-xs">
                                  <User className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                                  <span className="text-slate-600 dark:text-slate-400 font-semibold">
                                    {repair.repairer.fullName}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Right: Status & QC */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <Badge className={`${repairStatusBadge.variant} text-xs px-2.5 py-1 gap-1 font-bold`}>
                                <RepairStatusIcon className="h-3.5 w-3.5" />
                                {repairStatusBadge.label}
                              </Badge>
                              
                              {/* QC Status */}
                              {repair.qcPassed !== null && (
                                <div className="text-xs font-bold">
                                  {repair.qcPassed ? (
                                    <span className="text-green-600 dark:text-green-400">✅ QC Pass</span>
                                  ) : (
                                    <span className="text-red-600 dark:text-red-400">❌ QC Fail</span>
                                  )}
                                </div>
                              )}
                              {repair.qcPassed === null && repair.status === 'COMPLETED' && (
                                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">⏳ QC Pending</span>
                              )}

                              {/* Completed Date */}
                              {repair.completedAt && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                                  {formatDateTime(repair.completedAt).split(',')[0]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pengelola Actions */}
          {isPengelola && ticket.status === 'RETURN_SHIPPED' && !ticket.cassetteReturn?.receivedAtPengelola && (
            <ActionCard color="orange">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Package className="h-5 w-5" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Kaset telah dikirim
                  </span>
                </div>
                <Link href={`/tickets/${ticket.id}/receive-return`} className="w-full block">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800 text-white font-semibold" size="lg">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                  Terima Kembali
                </Button>
              </Link>
              </div>
            </ActionCard>
          )}
          </div>
        </div>
      </div>

      {/* Receive Delivery Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <Package className="h-5 w-5" />
              Konfirmasi Penerimaan di RC
            </DialogTitle>
            <DialogDescription>
              Konfirmasi bahwa {isMultiCassette ? `${cassetteCount} kaset` : 'kaset'} telah diterima di RC. 
              Status ticket akan berubah menjadi RECEIVED dan siap untuk mulai diagnosa/repair.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Info:</strong> Setelah konfirmasi, status ticket berubah menjadi RECEIVED dan Anda dapat mulai membuat repair ticket untuk diagnosa.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receive-notes">Catatan (Opsional)</Label>
              <Textarea
                id="receive-notes"
                placeholder="Masukkan catatan jika diperlukan..."
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReceiveDialog(false);
                setReceiveNotes('');
              }}
              disabled={receiving}
            >
              Batal
            </Button>
            <Button
              onClick={handleReceiveDelivery}
              disabled={receiving}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {receiving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengonfirmasi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Konfirmasi Penerimaan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Pickup Dialog */}
      <Dialog open={showPickupDialog} onOpenChange={setShowPickupDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="h-5 w-5" />
              Konfirmasi Pickup
            </DialogTitle>
            <DialogDescription>
              Konfirmasi bahwa Pengelola telah mengambil {isMultiCassette ? `${cassetteCount} kaset` : 'kaset'} di RC. 
              Status kaset akan langsung berubah menjadi OK.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Info:</strong> Setelah konfirmasi, status kaset langsung berubah menjadi OK dan ticket menjadi CLOSED.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pickup-notes">Catatan (Opsional)</Label>
              <Textarea
                id="pickup-notes"
                placeholder="Masukkan catatan jika diperlukan..."
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPickupDialog(false);
                setPickupNotes('');
              }}
              disabled={confirmingPickup}
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirmPickup}
              disabled={confirmingPickup}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              {confirmingPickup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengonfirmasi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Konfirmasi Pickup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Hapus Service Order?
            </DialogTitle>
            <DialogDescription>
              Hapus SO <span className="font-mono text-[#E60012]">{ticket?.ticketNumber}</span>?
            </DialogDescription>
            <div className="space-y-3 pt-4">
              {ticket?.status === 'CLOSED' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-3">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    ⚠️ Tiket ini sudah CLOSED. Hanya Super Admin yang dapat menghapus tiket yang sudah ditutup.
                  </p>
                </div>
              )}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm space-y-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-300">⚠️ Yang akan terjadi:</p>
                <ul className="list-disc list-inside text-yellow-800 dark:text-yellow-400 space-y-1">
                  <li>SO dihapus (soft delete)</li>
                  <li>Status cassette → OK</li>
                  <li>Data tersimpan untuk audit</li>
                </ul>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

// Helper Components
const InfoBlock = ({ icon: Icon, iconColor, title, children }: any) => (
  <div className="space-y-2">
    <div className={`flex items-center gap-1.5 ${iconColor} mb-2`}>
      <Icon className="h-4 w-4" />
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-slate-200">{title}</span>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value, mono = false, valueClass = '' }: any) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</p>
    <p className={`text-sm font-bold ${mono ? 'font-mono' : ''} ${valueClass || 'text-gray-900 dark:text-slate-100'}`}>
      {value}
    </p>
  </div>
);

const ActionCard = ({ color, children }: any) => {
  const colors = {
    amber: 'border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-900/20',
    red: 'border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-900/20',
    yellow: 'border-yellow-300 dark:border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20',
    green: 'border-green-300 dark:border-green-500/50 bg-green-50 dark:bg-green-900/20',
    orange: 'border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-900/20',
    rose: 'border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-900/20',
    cyan: 'border-cyan-300 dark:border-cyan-500/50 bg-cyan-50 dark:bg-cyan-900/20',
    teal: 'border-teal-300 dark:border-teal-500/50 bg-teal-50 dark:bg-teal-900/20',
  };
  return (
    <Card className={`border-2 ${colors[color as keyof typeof colors]} bg-white dark:bg-slate-800`}>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
};

