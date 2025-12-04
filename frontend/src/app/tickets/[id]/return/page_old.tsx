'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ReturnDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
          setError(`Cannot create return delivery for ticket with status ${response.data.status}. Ticket must be RESOLVED first.`);
        }

        if (response.data.cassetteReturn) {
          setError('Return delivery already exists for this ticket.');
        }
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        setError(error.response?.data?.message || 'Failed to fetch ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate courier service
      if (formData.courierService === 'OTHER' && !customCourierService.trim()) {
        setError('Nama jasa kurir wajib diisi jika memilih "Lainnya"');
        setSubmitting(false);
        return;
      }

      const finalCourierService = formData.courierService === 'OTHER' ? customCourierService : formData.courierService;
      
      // Convert date strings to ISO 8601 format
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

      setSuccess(true);
      setTimeout(() => {
        router.push('/tickets');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating return delivery:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to create return delivery';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // If there are field-specific errors, include them
        if (errorData.errors && typeof errorData.errors === 'object') {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          if (fieldErrors) {
            errorMessage = `${errorMessage}. ${fieldErrors}`;
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (error && !ticket) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/tickets')}>
              Back to Tickets
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kirim Kaset Kembali ke Vendor</h1>
          <p className="text-muted-foreground mt-2">
            Input detail pengiriman kaset yang sudah diperbaiki kembali ke vendor
          </p>
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Ticket:</span> {ticket?.ticketNumber}
              </p>
              <p>
                <span className="font-medium">Machine:</span> {ticket?.machine?.serialNumberManufacturer}
              </p>
              <p>
                <span className="font-medium">Bank:</span> {ticket?.machine?.customerBank?.bankName}
              </p>
              <p>
                <span className="font-medium">Status:</span> {ticket?.status}
              </p>
              {ticket?.cassetteDelivery?.cassette && (
                <p>
                  <span className="font-medium">Cassette:</span> {ticket.cassetteDelivery.cassette.serialNumber}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Return Form */}
        {ticket?.status === 'RESOLVED' && !ticket?.cassetteReturn && !success ? (
          <Card>
            <CardHeader>
              <CardTitle>Form Pengiriman Kaset ke Vendor</CardTitle>
              <CardDescription>Input detail pengiriman kaset yang sudah diperbaiki kembali ke vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shippedDate">Tanggal Pengiriman *</Label>
                  <Input
                    id="shippedDate"
                    type="date"
                    value={formData.shippedDate}
                    onChange={(e) => setFormData({ ...formData, shippedDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courierService">Kurir / Jasa Pengiriman</Label>
                  <Select 
                    value={formData.courierService} 
                    onValueChange={(value) => setFormData({ ...formData, courierService: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jasa kurir" />
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
                      <SelectItem value="LAZADA_EXPRESS">Lazada Express</SelectItem>
                      <SelectItem value="RPX">RPX</SelectItem>
                      <SelectItem value="SAP_EXPRESS">SAP Express</SelectItem>
                      <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Courier Service (if OTHER selected) */}
                {formData.courierService === 'OTHER' && (
                  <div className="space-y-2">
                    <Label htmlFor="customCourierService">Nama Jasa Kurir *</Label>
                    <Input
                      id="customCourierService"
                      value={customCourierService}
                      onChange={(e) => setCustomCourierService(e.target.value)}
                      placeholder="Masukkan nama jasa kurir"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Nomor Tracking</Label>
                  <Input
                    id="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    placeholder="e.g., JNE1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedArrival">Estimasi Kedatangan</Label>
                  <Input
                    id="estimatedArrival"
                    type="date"
                    value={formData.estimatedArrival}
                    onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Catatan tambahan mengenai pengiriman"
                    rows={3}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Mengirim...' : 'Kirim Kaset'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push('/tickets')}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : success ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-green-600 font-medium mb-4">✅ Return delivery berhasil dibuat!</p>
              <p className="text-muted-foreground">Mengalihkan ke halaman tickets...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {ticket?.status !== 'RESOLVED'
                  ? `Ticket must be RESOLVED first. Current status: ${ticket?.status}`
                  : 'Return delivery already exists for this ticket.'}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/tickets')}>
                Back to Tickets
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

