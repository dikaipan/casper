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
  ArrowLeft,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Truck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function TicketReplacementPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [oldCassette, setOldCassette] = useState<any>(null);
  const [newCassette, setNewCassette] = useState<any>(null);
  const [isReplaced, setIsReplaced] = useState(false);
  const [hasReturnDelivery, setHasReturnDelivery] = useState(false);
  
  // Form fields
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [notes, setNotes] = useState('');

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
        setLoading(true);
        
        // Fetch ticket
        const ticketResponse = await api.get(`/tickets/${ticketId}`);
        const ticketData = ticketResponse.data;
        setTicket(ticketData);

        // Find cassette with requestReplacement = true
        const replacementDetail = ticketData.cassetteDetails?.find((detail: any) => 
          detail.requestReplacement === true
        );

        let cassetteToReplace = null;
        if (replacementDetail && replacementDetail.cassette) {
          cassetteToReplace = replacementDetail.cassette;
        } else if (ticketData.cassette && ticketData.cassetteDetails?.some((d: any) => d.requestReplacement)) {
          // Fallback: use main cassette if replacement is requested
          cassetteToReplace = ticketData.cassette;
        } else {
          toast({
            title: 'Error',
            description: 'Ticket ini tidak memiliki replacement request',
            variant: 'destructive',
          });
          router.push(`/tickets/${ticketId}`);
          return;
        }

        // Fetch full cassette data with replacement info
        if (cassetteToReplace?.id) {
          try {
            const cassetteResponse = await api.get(`/cassettes/${cassetteToReplace.id}`);
            const fullCassetteData = cassetteResponse.data;
            setOldCassette(fullCassetteData);

            // Check if cassette has been replaced
            if (fullCassetteData.status === 'SCRAPPED' && fullCassetteData.replacementFor && fullCassetteData.replacementFor.length > 0) {
              // Cassette sudah di-replace, ambil kaset baru
              setIsReplaced(true);
              const replacementCassetteId = fullCassetteData.replacementFor[0].id;
              try {
                const newCassetteResponse = await api.get(`/cassettes/${replacementCassetteId}`);
                setNewCassette(newCassetteResponse.data);
              } catch (err) {
                console.warn('Could not fetch new cassette:', err);
              }
            } else if (fullCassetteData.replacementFor && fullCassetteData.replacementFor.length > 0) {
              // Check via replacementFor relation
              setIsReplaced(true);
              setNewCassette(fullCassetteData.replacementFor[0]);
            }
          } catch (err) {
            console.warn('Could not fetch full cassette data:', err);
            setOldCassette(cassetteToReplace);
          }
        } else {
          setOldCassette(cassetteToReplace);
        }
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load ticket data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && ticketId) {
      fetchData();
    }
  }, [isAuthenticated, ticketId, toast, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!newSerialNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Serial Number baru wajib diisi',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    if (!oldCassette?.id || !ticket?.id) {
      toast({
        title: 'Error',
        description: 'Data ticket atau cassette tidak lengkap',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/cassettes/replace', {
        oldCassetteId: oldCassette.id,
        newSerialNumber: newSerialNumber.trim(),
        replacementTicketId: ticket.id,
        notes: notes.trim() || undefined,
      });

      const replacementData = response.data || {};
      
      toast({
        title: 'Success',
        description: `Kaset ${oldCassette.serialNumber} berhasil diganti dengan ${newSerialNumber.trim()}`,
      });

      // Refresh data to show replacement info
      const fetchData = async () => {
        try {
          const ticketResponse = await api.get(`/tickets/${ticketId}`);
          const ticketData = ticketResponse.data;
          setTicket(ticketData);
          
          // Check if return delivery already exists
          if (ticketData.cassetteReturn) {
            setHasReturnDelivery(true);
          }

          const replacementDetail = ticketData.cassetteDetails?.find((detail: any) => 
            detail.requestReplacement === true
          );

          if (replacementDetail?.cassette?.id) {
            const cassetteResponse = await api.get(`/cassettes/${replacementDetail.cassette.id}`);
            const fullCassetteData = cassetteResponse.data;
            setOldCassette(fullCassetteData);

            if (fullCassetteData.replacementFor && fullCassetteData.replacementFor.length > 0) {
              setIsReplaced(true);
              setNewCassette(fullCassetteData.replacementFor[0]);
            } else if (replacementData.newCassette) {
              setIsReplaced(true);
              setNewCassette(replacementData.newCassette);
            }
          }
        } catch (err) {
          console.error('Error refreshing data:', err);
        }
      };

      await fetchData();
      
      // Clear form
      setNewSerialNumber('');
      setNotes('');
    } catch (error: any) {
      console.error('Error replacing cassette:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Gagal mengganti kaset';
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-[#2563EB]" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!ticket || !oldCassette) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg">Ticket atau cassette tidak ditemukan</p>
            <Button onClick={() => router.push(`/tickets/${ticketId}`)} className="mt-4">
              Kembali ke Ticket Detail
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const replacementDetail = ticket.cassetteDetails?.find((detail: any) => 
    detail.cassetteId === oldCassette.id && detail.requestReplacement === true
  );

  // Check if already replaced
  const alreadyReplaced = isReplaced || (oldCassette?.status === 'SCRAPPED' && oldCassette?.replacementFor?.length > 0);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/tickets/${ticketId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Form Replacement Cassette</h1>
              <p className="text-sm text-muted-foreground">
                Ganti SN kaset yang tidak layak pakai dengan SN baru (TIDAK melalui repair ticket)
              </p>
            </div>
          </div>
        </div>

        {/* Info Card - Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Ticket Number</Label>
                <p className="text-lg font-semibold font-mono">{ticket.ticketNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p className="text-lg font-semibold">{ticket.status || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card - Replacement Status */}
        {alreadyReplaced && newCassette && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Replacement Sudah Dilakukan
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Kaset sudah berhasil diganti dengan kaset baru
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Kaset Lama (SCRAPPED)</Label>
                  <p className="text-lg font-semibold font-mono text-red-600 dark:text-red-400">
                    {oldCassette?.serialNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Kaset Baru (OK)</Label>
                  <p className="text-lg font-semibold font-mono text-green-600 dark:text-green-400">
                    {newCassette?.serialNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-semibold mb-2">Informasi Kaset Baru:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span> {newCassette?.cassetteType?.typeCode || 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bank:</span> {newCassette?.customerBank?.bankName || 'N/A'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span> <span className="text-green-600 dark:text-green-400 font-semibold">{newCassette?.status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span> {newCassette?.createdAt ? new Date(newCassette.createdAt).toLocaleDateString('id-ID') : 'N/A'}
                  </div>
                </div>
              </div>
              
              {/* Next Step: Return Delivery */}
              {!hasReturnDelivery && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-lg shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg flex-shrink-0">
                      <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-blue-900 dark:text-blue-100 mb-2">
                        ⚠️ Langkah Selanjutnya: Kirim Kembali Kaset Baru ke Pengelola
                      </p>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          ✅ Kaset baru dengan SN <span className="font-mono font-bold text-blue-900 dark:text-blue-100">{newCassette?.serialNumber}</span> sudah dibuat.
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          📦 Kaset baru perlu dikirim kembali ke pengelola melalui return delivery.
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          🔄 Ticket status sudah di-update ke <span className="font-semibold">RESOLVED</span> dan siap untuk create return delivery.
                        </p>
                      </div>
                      <Link href={`/tickets/${ticketId}/return`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg">
                          <Truck className="h-4 w-4 mr-2" />
                          Buat Return Delivery untuk Kaset Baru
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {hasReturnDelivery && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        Return Delivery Sudah Dibuat
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Kaset baru sudah dikirim kembali ke pengelola. Silakan cek status di ticket detail.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card - Old Cassette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Kaset Lama
            </CardTitle>
            <CardDescription>
              {alreadyReplaced 
                ? 'Kaset yang sudah diganti (Status: SCRAPPED)'
                : 'Kaset yang akan diganti (akan di-mark sebagai SCRAPPED)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Serial Number</Label>
                <p className="text-lg font-semibold font-mono">{oldCassette?.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p className={`text-lg font-semibold ${oldCassette?.status === 'SCRAPPED' ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {oldCassette?.status || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Type</Label>
                <p className="text-lg font-semibold">{oldCassette?.cassetteType?.typeCode || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Bank</Label>
                <p className="text-lg font-semibold">{oldCassette?.customerBank?.bankName || 'N/A'}</p>
              </div>
            </div>
            
            {replacementDetail && !alreadyReplaced && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Replacement Requested
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {replacementDetail.replacementReason || 'Kaset tidak layak pakai'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replacement Form - Only show if not already replaced */}
        {!alreadyReplaced ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Kaset Baru (Pengganti)
              </CardTitle>
              <CardDescription>
                Input Serial Number baru untuk kaset pengganti. Type, Bank, Machine, dan UsageType akan otomatis diisi dari kaset lama.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newSerialNumber">
                  Serial Number Baru <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newSerialNumber"
                  value={newSerialNumber}
                  onChange={(e) => setNewSerialNumber(e.target.value.toUpperCase())}
                  placeholder="Contoh: RB-BNI-0002"
                  required
                  className="text-lg font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Serial Number baru untuk kaset pengganti
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan untuk replacement..."
                  rows={4}
                />
              </div>

              {/* Auto-fill Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                <p className="text-sm font-semibold mb-2">Data yang akan otomatis diisi:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Type: {oldCassette?.cassetteType?.typeCode || 'N/A'}</li>
                  <li>• Bank: {oldCassette?.customerBank?.bankName || 'N/A'}</li>
                  <li>• Machine: {oldCassette?.machine?.serialNumberManufacturer || 'N/A'}</li>
                  <li>• Usage Type: {oldCassette?.usageType || 'N/A'}</li>
                  <li>• Status: OK (baru dibuat)</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/tickets/${ticketId}`)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !newSerialNumber.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Replacement
                    </>
                  )}
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900/20">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Replacement Sudah Dilakukan</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Kaset {oldCassette?.serialNumber} sudah diganti dengan {newCassette?.serialNumber}
                </p>
              </div>
              
              {/* Next Step: Return Delivery */}
              {!hasReturnDelivery && newCassette && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-lg mb-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg flex-shrink-0">
                      <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-blue-900 dark:text-blue-100 mb-2">
                        ⚠️ Langkah Selanjutnya: Kirim Kembali Kaset Baru ke Pengelola
                      </p>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          ✅ Kaset baru dengan SN <span className="font-mono font-bold text-blue-900 dark:text-blue-100">{newCassette?.serialNumber}</span> sudah dibuat.
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          📦 Kaset baru perlu dikirim kembali ke pengelola melalui return delivery.
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          🔄 Ticket status sudah di-update ke <span className="font-semibold">RESOLVED</span> dan siap untuk create return delivery.
                        </p>
                      </div>
                      <Link href={`/tickets/${ticketId}/return`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold w-full shadow-lg">
                          <Truck className="h-4 w-4 mr-2" />
                          Buat Return Delivery untuk Kaset Baru
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {hasReturnDelivery && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        Return Delivery Sudah Dibuat
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Kaset baru sudah dikirim kembali ke pengelola. Silakan cek status di ticket detail.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push(`/tickets/${ticketId}`)}
                  variant="outline"
                >
                  Kembali ke Ticket Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

