'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { formatDateTime } from '@/lib/utils';

export default function CreateDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [cassettes, setCassettes] = useState<any[]>([]);
  const [selectedCassetteId, setSelectedCassetteId] = useState<string>('');
  const [shippedDate, setShippedDate] = useState('');
  const [courierService, setCourierService] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      if (!isAuthenticated || !ticketId) return;

      try {
        const [ticketRes, cassettesRes] = await Promise.all([
          api.get(`/tickets/${ticketId}`),
          api.get('/cassettes'),
        ]);

        setTicket(ticketRes.data);

        // Filter cassettes: must be from same bank and status OK or BAD
        const bankId = ticketRes.data.machine?.customerBank?.id;
        const machineId = ticketRes.data.machine?.id;
        
        console.log('Filtering cassettes:', {
          bankId,
          machineId,
          totalCassettes: cassettesRes.data.length,
        });
        
        const filtered = cassettesRes.data.filter(
          (c: any) => {
            const matchesBank = c.customerBank?.id === bankId;
            const matchesStatus = c.status === 'OK' || c.status === 'BAD';
            
            console.log(`Cassette ${c.serialNumber}:`, {
              matchesBank,
              matchesStatus,
              status: c.status,
            });
            
            return matchesBank && matchesStatus;
          }
        );

        console.log('Filtered cassettes:', filtered.length);
        setCassettes(filtered);
        
        // Warn if no cassettes found
        if (filtered.length === 0) {
          console.warn('No cassettes found for machine', machineId);
        }

        if (ticketRes.data.status !== 'OPEN') {
          setError(
            `Cannot create delivery for ticket with status ${ticketRes.data.status}. Ticket must be OPEN first.`,
          );
        }

        if (ticketRes.data.cassetteDelivery) {
          setError('Delivery form already exists for this ticket.');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && ticketId) {
      fetchData();
    }
  }, [isAuthenticated, ticketId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!selectedCassetteId || !shippedDate.trim()) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/tickets/delivery', {
        ticketId,
        cassetteId: selectedCassetteId,
        shippedDate: shippedDate.trim(),
        courierService: courierService.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        estimatedArrival: estimatedArrival.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccess('Form pengiriman berhasil dibuat! Kaset akan dikirim ke RC.');
      
      setTimeout(() => {
        router.push('/tickets');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create delivery form. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated || (user?.userType !== 'PENGELOLA' && user?.userType !== 'HITACHI')) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Access denied. Pengelola users or admin only.</p>
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
            <p className="text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const selectedCassette = cassettes.find((c) => c.id === selectedCassetteId);

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Form Pengiriman Kaset</h1>
        <p className="text-muted-foreground mt-2">
          Input informasi pengiriman kaset rusak ke Repair Center
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket: {ticket.ticketNumber}</CardTitle>
            <CardDescription>{ticket.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Machine SN:</span> <span className="font-mono">{ticket.machine?.serialNumberManufacturer}</span>
              </p>
              {ticket.machine?.machineCode && (
                <p>
                  <span className="font-medium">Machine Code:</span> {ticket.machine.machineCode}
                </p>
              )}
              <p>
                <span className="font-medium">Bank:</span> {ticket.machine?.customerBank?.bankName}
              </p>
              <p>
                <span className="font-medium">Status:</span> {ticket.status}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Form */}
        {ticket.status === 'OPEN' && !ticket.cassetteDelivery ? (
          <Card>
            <CardHeader>
              <CardTitle>Form Pengiriman Kaset ke RC</CardTitle>
              <CardDescription>
                Input detail pengiriman kaset rusak ke Hitachi Repair Center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Select Cassette */}
                <div className="space-y-2">
                  <Label htmlFor="cassette">Kaset yang Dikirim *</Label>
                  {cassettes.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        ⚠️ No cassettes found for this machine
                      </p>
                      <p className="text-sm text-yellow-700 mb-3">
                        To create a delivery form, you need a cassette from this machine that is marked as <strong>OK</strong> or <strong>BAD</strong>.
                      </p>
                      <div className="text-xs text-yellow-600 space-y-1">
                        <p>• Machine: <strong>{ticket.machine?.serialNumberManufacturer || ticket.machine?.machineCode}</strong></p>
                        <p>• Bank: <strong>{ticket.machine?.customerBank?.bankName}</strong></p>
                        <p>• Required status: OK or BAD</p>
                      </div>
                      <p className="text-sm text-yellow-700 mt-3">
                        <strong>Solution:</strong> Please ensure the bad cassette is properly marked in the system before creating the delivery form.
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={selectedCassetteId}
                      onValueChange={setSelectedCassetteId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kaset yang akan dikirim" />
                      </SelectTrigger>
                      <SelectContent>
                        {cassettes.map((cassette) => (
                          <SelectItem key={cassette.id} value={cassette.id}>
                            <div className="flex flex-col">
                              <span className="font-mono font-medium">{cassette.serialNumber}</span>
                              <span className="text-xs text-muted-foreground">
                                {cassette.cassetteType?.typeCode || 'N/A'}
                                {cassette.cassetteType?.typeCode && cassette.cassetteType?.typeName && (
                                  <span className="ml-1">({cassette.cassetteType.typeName})</span>
                                )}
                                {' • '}
                                {cassette.status}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedCassette && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium">
                        {selectedCassette.serialNumber} ({selectedCassette.cassetteType?.typeCode})
                      </p>
                      <p className="text-muted-foreground">
                        Type: {selectedCassette.cassetteType?.typeCode || 'N/A'}
                        {selectedCassette.cassetteType?.typeCode && selectedCassette.cassetteType?.typeName && (
                          <span className="ml-1">({selectedCassette.cassetteType.typeName})</span>
                        )}
                        {' • '}
                        Status: {selectedCassette.status}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipped Date */}
                <div className="space-y-2">
                  <Label htmlFor="shippedDate">Tanggal Pengiriman *</Label>
                  <Input
                    id="shippedDate"
                    type="date"
                    value={shippedDate}
                    onChange={(e) => setShippedDate(e.target.value)}
                    required
                  />
                </div>

                {/* Courier Service */}
                <div className="space-y-2">
                  <Label htmlFor="courierService">Jasa Kurir (Optional)</Label>
                  <Input
                    id="courierService"
                    placeholder="e.g., JNE, TIKI, Pos Indonesia"
                    value={courierService}
                    onChange={(e) => setCourierService(e.target.value)}
                  />
                </div>

                {/* Tracking Number */}
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Nomor Resi (Optional)</Label>
                  <Input
                    id="trackingNumber"
                    placeholder="e.g., JNE123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>

                {/* Estimated Arrival */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedArrival">Estimasi Tiba di RC (Optional)</Label>
                  <Input
                    id="estimatedArrival"
                    type="date"
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Tambahan (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Kaset dikirim dalam kondisi baik, sudah dikemas dengan benar"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">{success}</p>
                    <p className="text-xs text-green-600 mt-1">Redirecting to tickets page...</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/tickets')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      submitting || !selectedCassetteId || !shippedDate.trim() || cassettes.length === 0
                    }
                    className="flex-1"
                  >
                    {submitting ? 'Creating...' : 'Submit Form Pengiriman'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {ticket.status !== 'OPEN'
                  ? `Ticket must be OPEN first. Current status: ${ticket.status}`
                  : 'Delivery form already exists for this ticket.'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/tickets')}
              >
                Back to Tickets
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

