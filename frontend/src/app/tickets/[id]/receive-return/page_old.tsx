'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ReceiveReturnPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { user } = useAuthStore();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await api.get(`/tickets/${ticketId}`);
        setTicket(response.data);

        if (!response.data.cassetteReturn) {
          setError('No return delivery found for this ticket.');
        } else if (response.data.cassetteReturn.receivedAtVendor) {
          setError('Cassette already received at vendor.');
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
      await api.post(`/tickets/${ticketId}/receive-return`, {
        notes,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/tickets');
      }, 1500);
    } catch (error: any) {
      console.error('Error receiving return:', error);
      setError(error.response?.data?.message || 'Failed to receive return');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const returnInfo = ticket?.cassetteReturn;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Terima Kaset dari RC</h1>
          <p className="text-muted-foreground mt-2">
            Konfirmasi penerimaan kaset yang sudah diperbaiki dari Repair Center
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
            </div>
          </CardContent>
        </Card>

        {/* Return Info */}
        {returnInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Return Delivery Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Cassette:</span> {returnInfo.cassette?.serialNumber}
                </p>
                <p>
                  <span className="font-medium">Shipped Date:</span> {formatDateTime(returnInfo.shippedDate)}
                </p>
                {returnInfo.courierService && (
                  <p>
                    <span className="font-medium">Courier:</span> {returnInfo.courierService}
                  </p>
                )}
                {returnInfo.trackingNumber && (
                  <p>
                    <span className="font-medium">Tracking:</span> {returnInfo.trackingNumber}
                  </p>
                )}
                {returnInfo.estimatedArrival && (
                  <p>
                    <span className="font-medium">Estimated Arrival:</span> {formatDateTime(returnInfo.estimatedArrival)}
                  </p>
                )}
                {returnInfo.sender && (
                  <p>
                    <span className="font-medium">Sent By:</span> {returnInfo.sender.fullName} ({returnInfo.sender.role})
                  </p>
                )}
                {returnInfo.notes && (
                  <p>
                    <span className="font-medium">Notes:</span> {returnInfo.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receive Form */}
        {returnInfo && !returnInfo.receivedAtVendor && !success ? (
          <Card>
            <CardHeader>
              <CardTitle>Konfirmasi Penerimaan</CardTitle>
              <CardDescription>Konfirmasi bahwa kaset sudah diterima dari RC</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan mengenai kondisi kaset saat diterima"
                    rows={3}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Memproses...' : 'Konfirmasi Penerimaan'}
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
              <p className="text-green-600 font-medium mb-4">✅ Kaset berhasil diterima!</p>
              <p className="text-muted-foreground">Ticket akan ditutup secara otomatis. Mengalihkan ke halaman tickets...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {returnInfo?.receivedAtVendor
                  ? 'Cassette already received at vendor.'
                  : 'No return delivery found for this ticket.'}
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

