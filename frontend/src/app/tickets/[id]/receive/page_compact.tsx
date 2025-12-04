'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  MapPin,
  FileText,
  Loader2,
} from 'lucide-react';

export default function ReceiveDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!isAuthenticated || !ticketId) return;

      try {
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data);

        if (response.data.status !== 'IN_DELIVERY') {
          setError(`Status SO harus "IN_DELIVERY" untuk bisa diterima.`);
        }

        if (response.data.cassetteDelivery?.receivedAtRc) {
          setError('Kaset sudah diterima di RC.');
        }
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        setError(error.response?.data?.message || 'SO tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && ticketId) {
      fetchTicket();
    }
  }, [isAuthenticated, ticketId]);

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post(`/tickets/${ticketId}/receive-delivery`, {
        notes: notes.trim() || undefined,
      });

      setSuccess('✅ Kaset berhasil diterima di RC!');
      
      setTimeout(() => {
        router.push(`/tickets/${ticketId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menerima kaset. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Akses ditolak. Hanya untuk RC Staff.</p>
          </CardContent>
        </Card>
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
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const delivery = ticket.cassetteDelivery;
  const canReceive = ticket.status === 'IN_DELIVERY' && delivery && !delivery.receivedAtRc;

  return (
    <PageLayout>
      {/* Compact Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terima Kaset di RC</h1>
            <p className="text-sm text-gray-600 mt-1">
              SO: <span className="font-mono font-bold">{ticket.ticketNumber}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6 border-2">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="text-xs mt-2 text-green-600 font-medium">Dikirim</span>
            </div>
            <div className="flex-1 h-1 bg-cyan-500" />
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center ring-4 ring-cyan-200">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-xs mt-2 text-cyan-600 font-bold">Terima</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200" />
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                3
              </div>
              <span className="text-xs mt-2 text-gray-400">Repair</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Left: Info Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Compact Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Cassette Info */}
                <div>
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-bold">KASET</span>
                  </div>
                  <p className="font-mono font-bold text-sm">{delivery?.cassette?.serialNumber || 'N/A'}</p>
                  {delivery?.cassette?.cassetteType && (
                    <p className="text-xs text-gray-600 mt-1">
                      {delivery.cassette.cassetteType.typeCode}
                    </p>
                  )}
                </div>

                {/* Sender Info */}
                <div>
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-xs font-bold">PENGIRIM</span>
                  </div>
                  <p className="text-sm font-medium">{delivery?.sender?.fullName || 'N/A'}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {delivery?.sender?.vendor?.companyName || 'N/A'}
                  </p>
                </div>

                {/* Shipping Info */}
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Truck className="h-4 w-4" />
                    <span className="text-xs font-bold">KURIR</span>
                  </div>
                  <p className="text-sm font-medium">{delivery?.courierService || 'N/A'}</p>
                  {delivery?.trackingNumber && (
                    <p className="text-xs text-gray-600 mt-1 font-mono">
                      {delivery.trackingNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dikirim
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {delivery?.shippedDate
                      ? new Date(delivery.shippedDate).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
                {delivery?.estimatedArrival && (
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Estimasi Tiba
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(delivery.estimatedArrival).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Sender Address */}
              {delivery?.senderAddress && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    Alamat Pengirim
                  </p>
                  <p className="text-sm text-gray-700">
                    {delivery.senderAddress}, {delivery.senderCity}, {delivery.senderProvince} {delivery.senderPostalCode}
                  </p>
                  {delivery.senderContactName && (
                    <p className="text-xs text-gray-600 mt-1">
                      Kontak: {delivery.senderContactName} ({delivery.senderContactPhone})
                    </p>
                  )}
                </div>
              )}

              {/* Vendor Notes */}
              {delivery?.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Catatan Vendor:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                    {delivery.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SO Info */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-bold mb-3">SERVICE ORDER</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Title:</span>
                  <span className="text-sm font-medium">{ticket.title}</span>
                </div>
                {ticket.machine && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mesin:</span>
                      <span className="text-sm font-mono font-medium">
                        {ticket.machine.serialNumberManufacturer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bank:</span>
                      <span className="text-sm font-medium">
                        {ticket.machine.customerBank?.bankName || 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Action Panel */}
        <div>
          <Card className="border-2 border-cyan-200 bg-cyan-50/30 sticky top-6">
            <CardContent className="p-6">
              {canReceive ? (
                <form onSubmit={handleReceive} className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
                      <Package className="h-8 w-8 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Konfirmasi Penerimaan</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Verifikasi serial number kaset
                    </p>
                  </div>

                  {/* Verification Box */}
                  <div className="bg-white border-2 border-cyan-300 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600 mb-2">Serial Number:</p>
                    <p className="font-mono text-2xl font-bold text-cyan-700">
                      {delivery?.cassette?.serialNumber}
                    </p>
                    <Badge className="mt-2 bg-cyan-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Siap Diterima
                    </Badge>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">
                      Catatan (Opsional)
                    </label>
                    <Textarea
                      placeholder="Kondisi fisik kaset, kelengkapan, dll..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Success */}
                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {success}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
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
                          Terima Kaset
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
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    {!delivery
                      ? 'Data pengiriman tidak ditemukan'
                      : delivery.receivedAtRc
                        ? 'Kaset sudah diterima di RC'
                        : `Status SO: ${ticket.status}`}
                  </p>
                  <Button variant="outline" onClick={() => router.push('/tickets')}>
                    Kembali ke Daftar SO
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

