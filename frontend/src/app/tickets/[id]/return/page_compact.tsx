'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';

export default function ReturnDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [customCourierService, setCustomCourierService] = useState('');

  const [formData, setFormData] = useState({
    shippedDate: new Date().toISOString().split('T')[0],
    courierService: '',
    trackingNumber: '',
    estimatedArrival: '',
    notes: '',
  });

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data);

        if (response.data.status !== 'RESOLVED') {
          setMessage({ type: 'error', text: `Status SO harus "RESOLVED" untuk kirim kembali.` });
        }

        if (response.data.cassetteReturn) {
          setMessage({ type: 'error', text: 'Return delivery sudah dibuat untuk SO ini.' });
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

    // Validate courier
    if (formData.courierService === 'OTHER' && !customCourierService.trim()) {
      setMessage({ type: 'error', text: 'Nama jasa kurir wajib diisi jika memilih "Lainnya"' });
      return;
    }

    setSubmitting(true);

    try {
      const finalCourierService = formData.courierService === 'OTHER' ? customCourierService : formData.courierService;
      
      const shippedDateISO = formData.shippedDate 
        ? new Date(formData.shippedDate).toISOString() 
        : new Date().toISOString();
      
      const estimatedArrivalISO = formData.estimatedArrival 
        ? new Date(formData.estimatedArrival).toISOString() 
        : undefined;
      
      await api.post('/tickets/return', {
        ticketId,
        shippedDate: shippedDateISO,
        courierService: finalCourierService,
        trackingNumber: formData.trackingNumber.trim() || undefined,
        estimatedArrival: estimatedArrivalISO,
        notes: formData.notes.trim() || undefined,
      });

      setMessage({ type: 'success', text: '✅ Kaset berhasil dikirim kembali! Redirect...' });
      
      setTimeout(() => {
        router.push(`/tickets/${ticketId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error creating return:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal membuat return delivery' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get all cassettes
  const allCassettes = ticket?.cassetteDetails && ticket.cassetteDetails.length > 0
    ? ticket.cassetteDetails.map((detail: any) => detail.cassette).filter((c: any) => c !== null)
    : (ticket?.cassette ? [ticket.cassette] : []);

  const cassetteCount = allCassettes.length;
  const isMultiCassette = cassetteCount > 1;

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

  const canCreate = ticket.status === 'RESOLVED' && !ticket.cassetteReturn;

  return (
    <PageLayout>
      {/* Compact Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kirim Kembali ke Vendor</h1>
            <p className="text-sm text-gray-600 mt-1">
              SO: <span className="font-mono font-bold">{ticket.ticketNumber}</span>
              {isMultiCassette && <span className="ml-2 text-green-600 font-semibold">• {cassetteCount} Kaset</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="mb-6 border-2">
        <CardContent className="py-4">
          <div className="relative pt-2">
            <div className="flex justify-between mb-8">
              {['Received', 'Repair', 'Return'].map((step, index) => {
                const isActive = index === 2;
                const isPassed = index < 2;
                const icons = [Package, CheckCircle2, Truck];
                const StepIcon = icons[index];
                
                return (
                  <div key={step} className="flex flex-col items-center flex-1 relative">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10
                      ${isActive ? 'bg-green-600 text-white ring-4 ring-green-200 scale-110' :
                        isPassed ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-500'}
                    `}>
                      {isPassed && !isActive ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span className={`text-[10px] mt-2 text-center font-medium
                      ${isActive ? 'text-green-600 font-bold' : isPassed ? 'text-green-600' : 'text-gray-400'}
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
                <div className="flex items-center gap-2 text-green-600">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-bold">KASET YANG AKAN DIKIRIM</span>
                </div>
                <Badge className="bg-green-600 text-white">
                  {cassetteCount} Item
                </Badge>
              </div>

              {isMultiCassette ? (
                <div className="space-y-2">
                  {allCassettes.map((cassette: any, index: number) => (
                    <div key={cassette.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-bold text-sm text-gray-900">{cassette.serialNumber}</p>
                        {cassette.cassetteType && (
                          <p className="text-xs text-gray-600">{cassette.cassetteType.typeCode}</p>
                        )}
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
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
                  <Badge className="bg-green-500 text-white text-xs">{ticket.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Form Panel */}
        <div>
          {canCreate ? (
            <Card className="border-2 border-green-200 bg-green-50/30 sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Form Pengiriman</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Input detail pengiriman kembali
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Shipped Date */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      TANGGAL KIRIM *
                    </label>
                    <Input
                      type="date"
                      value={formData.shippedDate}
                      onChange={(e) => setFormData({ ...formData, shippedDate: e.target.value })}
                      required
                      className="text-sm"
                    />
                  </div>

                  {/* Courier */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      KURIR *
                    </label>
                    <Select 
                      value={formData.courierService} 
                      onValueChange={(value) => setFormData({ ...formData, courierService: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kurir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JNE">JNE</SelectItem>
                        <SelectItem value="TIKI">TIKI</SelectItem>
                        <SelectItem value="POS_INDONESIA">Pos Indonesia</SelectItem>
                        <SelectItem value="JNT">JNT</SelectItem>
                        <SelectItem value="SICEPAT">SiCepat</SelectItem>
                        <SelectItem value="NINJA_EXPRESS">Ninja Express</SelectItem>
                        <SelectItem value="WAHANA">Wahana</SelectItem>
                        <SelectItem value="GOJEK">Gojek</SelectItem>
                        <SelectItem value="GRAB">Grab</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Courier */}
                  {formData.courierService === 'OTHER' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">
                        NAMA KURIR *
                      </label>
                      <Input
                        value={customCourierService}
                        onChange={(e) => setCustomCourierService(e.target.value)}
                        placeholder="Masukkan nama kurir"
                        required
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Tracking */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      NO. RESI
                    </label>
                    <Input
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="Nomor tracking"
                      className="text-sm font-mono"
                    />
                  </div>

                  {/* Estimated Arrival */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      ESTIMASI TIBA
                    </label>
                    <Input
                      type="date"
                      value={formData.estimatedArrival}
                      onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                      className="text-sm"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">
                      CATATAN
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={isMultiCassette 
                        ? `Kondisi ${cassetteCount} kaset, dll...` 
                        : "Kondisi kaset, dll..."}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4 mr-2" />
                          {isMultiCassette ? `Kirim ${cassetteCount} Kaset` : 'Kirim Kaset'}
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
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-yellow-200 bg-yellow-50/30 sticky top-6">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  {ticket.status !== 'RESOLVED'
                    ? `Status SO: ${ticket.status}. Harus RESOLVED untuk kirim kembali.`
                    : 'Return delivery sudah dibuat.'}
                </p>
                <Button variant="outline" onClick={() => router.push('/tickets')}>
                  Kembali ke SO List
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

