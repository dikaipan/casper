'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/utils';

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
          setError(
            `Cannot receive delivery for ticket with status ${response.data.status}. Ticket must be IN_DELIVERY.`,
          );
        }

        if (response.data.cassetteDelivery?.receivedAtRc) {
          setError('Cassette already received at RC.');
        }
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        setError(error.response?.data?.message || 'Ticket not found');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && ticketId) {
      fetchTicket();
    }
  }, [isAuthenticated, ticketId, router]);

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post(`/tickets/${ticketId}/receive-delivery`, {
        notes: notes.trim() || undefined,
      });

      setSuccess('Kaset berhasil diterima di RC! Repair ticket sudah dibuat.');
      
      setTimeout(() => {
        router.push('/tickets');
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to receive delivery. Please try again.',
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

  if (!isAuthenticated || user?.userType !== 'HITACHI') {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Access denied. Hitachi RC Staff only.</p>
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

  const delivery = ticket.cassetteDelivery;

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Terima Kaset di RC</h1>
        <p className="text-muted-foreground mt-2">
          Konfirmasi penerimaan kaset fisik di Repair Center
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

        {/* Delivery Info */}
        {delivery && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Kaset yang Dikirim:</p>
                  <p className="font-mono text-lg">{delivery.cassette?.serialNumber}</p>
                  <p className="text-muted-foreground">
                    {delivery.cassette?.cassetteType?.typeName} ({delivery.cassette?.cassetteType?.typeCode})
                  </p>
                </div>
                <div>
                  <p className="font-medium">Dikirim Oleh:</p>
                  <p>{delivery.sender?.fullName} ({delivery.sender?.vendor?.companyName})</p>
                </div>
                <div>
                  <p className="font-medium">Tanggal Pengiriman:</p>
                  <p>{formatDateTime(delivery.shippedDate)}</p>
                </div>
                {delivery.courierService && (
                  <div>
                    <p className="font-medium">Jasa Kurir:</p>
                    <p>{delivery.courierService}</p>
                  </div>
                )}
                {delivery.trackingNumber && (
                  <div>
                    <p className="font-medium">Nomor Resi:</p>
                    <p className="font-mono">{delivery.trackingNumber}</p>
                  </div>
                )}
                {delivery.estimatedArrival && (
                  <div>
                    <p className="font-medium">Estimasi Tiba:</p>
                    <p>{formatDateTime(delivery.estimatedArrival)}</p>
                  </div>
                )}
                {delivery.notes && (
                  <div>
                    <p className="font-medium">Catatan Vendor:</p>
                    <p className="text-muted-foreground">{delivery.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receive Form */}
        {ticket.status === 'IN_DELIVERY' && delivery && !delivery.receivedAtRc ? (
          <Card>
            <CardHeader>
              <CardTitle>Konfirmasi Penerimaan</CardTitle>
              <CardDescription>
                Scan serial number kaset dan konfirmasi penerimaan di RC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceive} className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm font-medium mb-2">Verifikasi:</p>
                  <p className="text-sm text-muted-foreground">
                    Pastikan serial number kaset yang diterima: <span className="font-mono font-medium">{delivery.cassette?.serialNumber}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Penerimaan (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g., Kaset diterima dalam kondisi baik, sudah diverifikasi serial number"
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
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Processing...' : 'Konfirmasi Terima Kaset'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {!delivery
                  ? 'Delivery form not found for this ticket.'
                  : delivery.receivedAtRc
                    ? 'Cassette already received at RC.'
                    : `Cannot receive delivery. Ticket status: ${ticket.status}`}
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

