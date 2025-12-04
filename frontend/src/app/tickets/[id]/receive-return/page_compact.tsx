'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  Clock,
  FileText,
  Monitor,
  Home,
  Calendar,
  Hash,
} from 'lucide-react';

export default function ReceiveReturnPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data);

        if (!response.data.cassetteReturn) {
          setMessage({ type: 'error', text: 'Belum ada return delivery untuk SO ini.' });
        } else if (response.data.cassetteReturn.receivedAtVendor) {
          setMessage({ type: 'error', text: 'Kaset sudah diterima di vendor.' });
        }
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memuat SO' });
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await api.post(`/tickets/${ticketId}/receive-return`, { notes });
      setMessage({ type: 'success', text: '✅ Kaset berhasil diterima! Redirect...' });
      
      setTimeout(() => {
        router.push('/tickets');
      }, 1500);
    } catch (error: any) {
      console.error('Error receiving return:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal konfirmasi penerimaan' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get all cassettes
  const allCassettes = ticket?.cassetteDetails && ticket.cassetteDetails.length > 0
    ? ticket.cassetteDetails.map((detail: any) => detail.cassette).filter((c: any) => c !== null)
    : (ticket?.cassette ? [ticket.cassette] : []);

  const cassetteCount = allCassettes.length;
  const isMultiCassette = cassetteCount > 1;
  const returnInfo = ticket?.cassetteReturn;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  if (!ticket) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Service Order tidak ditemukan</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/tickets')}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const canConfirm = returnInfo && !returnInfo.receivedAtVendor;

  return (
    <PageLayout>
      {/* Compact Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Home className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terima Kaset dari RC</h1>
            <p className="text-sm text-gray-600 mt-1">
              SO: <span className="font-mono font-bold">{ticket.ticketNumber}</span>
              {isMultiCassette && <span className="ml-2 text-orange-600 font-semibold">• {cassetteCount} Kaset</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6 border-2">
        <CardContent className="py-4">
          <div className="relative pt-2">
            <div className="flex justify-between mb-8">
              {['Repair', 'Dikirim', 'Diterima'].map((step, index) => {
                const isActive = index === 2;
                const isPassed = index < 2;
                const icons = [CheckCircle2, Truck, Home];
                const StepIcon = icons[index];
                
                return (
                  <div key={step} className="flex flex-col items-center flex-1 relative">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10
                      ${isActive ? 'bg-orange-600 text-white ring-4 ring-orange-200 scale-110' :
                        isPassed ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-500'}
                    `}>
                      {isPassed && !isActive ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span className={`text-[10px] mt-2 text-center font-medium
                      ${isActive ? 'text-orange-600 font-bold' : isPassed ? 'text-green-600' : 'text-gray-400'}
                    `}>
                      {step}
                    </span>
                    {index < 2 && (
                      <div className={`
                        absolute top-5 left-1/2 w-full h-1 -z-10
                        ${isPassed ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          message.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info & Cassettes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cassettes List */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-bold">KASET DITERIMA</span>
                </div>
                <Badge className="bg-orange-600 text-white">
                  {cassetteCount} Item
                </Badge>
              </div>

              {isMultiCassette ? (
                <div className="space-y-2">
                  {allCassettes.map((cassette: any, index: number) => (
                    <div key={cassette.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-sm text-gray-900">{cassette.serialNumber}</p>
                        {cassette.cassetteType && (
                          <p className="text-xs text-gray-600">{cassette.cassetteType.typeCode}</p>
                        )}
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-mono font-bold text-sm">{allCassettes[0]?.serialNumber || 'N/A'}</p>
                  {allCassettes[0]?.cassetteType && (
                    <p className="text-xs text-gray-600 mt-1">
                      {allCassettes[0].cassetteType.typeCode}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Delivery Info */}
          {returnInfo && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-3">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs font-bold">INFO PENGIRIMAN</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] font-semibold">DIKIRIM</span>
                    </div>
                    <p className="text-xs font-medium">{formatDateTime(returnInfo.shippedDate)}</p>
                  </div>

                  {returnInfo.courierService && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Truck className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">KURIR</span>
                      </div>
                      <p className="text-xs font-medium">{returnInfo.courierService}</p>
                    </div>
                  )}

                  {returnInfo.trackingNumber && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">NO. RESI</span>
                      </div>
                      <p className="text-xs font-mono font-medium">{returnInfo.trackingNumber}</p>
                    </div>
                  )}

                  {returnInfo.estimatedArrival && (
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">ESTIMASI TIBA</span>
                      </div>
                      <p className="text-xs font-medium">{formatDateTime(returnInfo.estimatedArrival)}</p>
                    </div>
                  )}

                  {returnInfo.sender && (
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">DIKIRIM OLEH</span>
                      </div>
                      <p className="text-xs font-medium">{returnInfo.sender.fullName}</p>
                    </div>
                  )}

                  {returnInfo.notes && (
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <FileText className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">CATATAN PENGIRIMAN</span>
                      </div>
                      <p className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
                        {returnInfo.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SO Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Monitor className="h-4 w-4" />
                    <span className="text-xs font-bold">MESIN</span>
                  </div>
                  <p className="font-mono text-xs font-medium">
                    {ticket.machine?.serialNumberManufacturer || 'N/A'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-bold">REPORTER</span>
                  </div>
                  <p className="text-xs font-medium">{ticket.reporter?.fullName || 'N/A'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-bold">STATUS</span>
                  </div>
                  <Badge className="bg-purple-500 text-white text-xs">{ticket.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Confirmation Panel */}
        <div>
          {canConfirm && message?.type !== 'success' ? (
            <Card className="border-2 border-orange-200 bg-orange-50/30 sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Home className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Konfirmasi Penerimaan</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {isMultiCassette 
                      ? `Konfirmasi ${cassetteCount} kaset sudah diterima`
                      : 'Konfirmasi kaset sudah diterima'
                    }
                  </p>
                </div>

                {/* Verification Checklist */}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-800 mb-2">✓ Pastikan:</p>
                  <ul className="text-[10px] text-yellow-700 space-y-1">
                    <li>• {isMultiCassette ? 'Semua kaset' : 'Kaset'} sudah diterima fisik</li>
                    <li>• Kondisi {isMultiCassette ? 'kaset-kaset' : 'kaset'} baik</li>
                    <li>• Serial number sesuai</li>
                    <li>• Tidak ada kerusakan fisik</li>
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      CATATAN PENERIMAAN
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isMultiCassette 
                        ? `Kondisi ${cassetteCount} kaset, dll...` 
                        : "Kondisi kaset saat diterima, dll..."}
                      rows={4}
                      className="text-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isMultiCassette ? `Terima ${cassetteCount} Kaset` : 'Konfirmasi Penerimaan'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={submitting}
                      className="w-full"
                    >
                      Batal
                    </Button>
                  </div>
                </form>

                <div className="mt-4 pt-4 border-t border-orange-200">
                  <p className="text-[10px] text-gray-500 text-center">
                    💡 Setelah konfirmasi, SO akan otomatis ditutup (CLOSED)
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-yellow-200 bg-yellow-50/30 sticky top-6">
              <CardContent className="p-6 text-center">
                {message?.type === 'success' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-green-600 mb-2">Berhasil!</p>
                    <p className="text-sm text-gray-600">Kaset sudah diterima. SO ditutup otomatis.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      {!returnInfo
                        ? 'Belum ada return delivery untuk SO ini.'
                        : 'Kaset sudah diterima di vendor.'}
                    </p>
                    <Button variant="outline" onClick={() => router.push('/tickets')}>
                      Kembali ke SO List
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

