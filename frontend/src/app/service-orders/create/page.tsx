'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, CalendarCheck, Info, ArrowRight, Package, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function CreateServiceOrderPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const isPengelola = user?.userType === 'PENGELOLA';
  const isHitachi = user?.userType === 'HITACHI';

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Only Pengelola users can access this page
  if (!isLoading && user?.userType !== 'PENGELOLA') {
    return (
      <PageLayout>
        <Card className="max-w-2xl mx-auto mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <Info className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
              <p className="text-muted-foreground">
                Halaman ini hanya dapat diakses oleh user Pengelola.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
            Buat Service Order Baru
          </h1>
          <p className="text-lg text-muted-foreground">
            Pilih tipe service order yang ingin Anda buat
          </p>
        </div>

        {/* Service Order Type Selection Cards */}
        {/* PM feature is temporarily disabled for Pengelola users */}
        <div className={`grid grid-cols-1 ${isHitachi ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 lg:gap-8 mt-8`}>
          {/* Request Repair Card */}
          <Card className="border-2 hover:border-red-500 hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col"
                onClick={() => router.push('/tickets/create')}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <Wrench className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Request Repair</CardTitle>
              <CardDescription className="text-base">
                Perbaikan untuk kaset yang bermasalah
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 pb-6">
              <div className="flex items-start gap-3 text-sm text-muted-foreground flex-1">
                <Package className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="leading-relaxed">Untuk kaset yang mengalami kerusakan, error, atau tidak berfungsi dengan baik</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground flex-1">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="leading-relaxed">Proses perbaikan memerlukan pengiriman kaset ke Repair Center</p>
              </div>
              <Button className="w-full mt-auto bg-red-600 hover:bg-red-700 group-hover:shadow-md h-12 text-base font-semibold" size="lg">
                <Wrench className="mr-2 h-5 w-5" />
                Buat Request Repair
              </Button>
            </CardContent>
          </Card>

          {/* Request PM Card - Hidden for Pengelola users (temporarily disabled) */}
          {isHitachi && (
          <Card className="border-2 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col"
                onClick={() => router.push('/preventive-maintenance/create')}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <CalendarCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Request PM</CardTitle>
              <CardDescription className="text-base">
                Preventive Maintenance rutin
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 pb-6">
              <div className="flex items-start gap-3 text-sm text-muted-foreground flex-1">
                <Package className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="leading-relaxed">Perawatan berkala untuk mencegah kerusakan dan memastikan performa optimal</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground flex-1">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="leading-relaxed">Dijadwalkan secara teratur sesuai kebutuhan operasional</p>
              </div>
              <Button className="w-full mt-auto bg-blue-600 hover:bg-blue-700 group-hover:shadow-md h-12 text-base font-semibold" size="lg">
                <CalendarCheck className="mr-2 h-5 w-5" />
                Buat Request PM
              </Button>
            </CardContent>
          </Card>
          )}

          {/* Request Replacement Card */}
          <Card className="border-2 hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col"
                onClick={() => router.push('/service-orders/replacement/create')}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Request Replacement</CardTitle>
              <CardDescription className="text-base">
                Pergantian kaset yang tidak layak pakai
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 pb-6">
              <div className="flex items-start gap-3 text-sm text-muted-foreground flex-1">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <p className="leading-relaxed">Untuk kaset yang tidak dapat diperbaiki dan perlu diganti dengan kaset baru</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground flex-1">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <p className="leading-relaxed">Kaset akan ditandai sebagai tidak layak pakai (SCRAPPED) setelah proses selesai</p>
              </div>
              <Button className="w-full mt-auto bg-orange-600 hover:bg-orange-700 group-hover:shadow-md h-12 text-base font-semibold" size="lg">
                <RefreshCw className="mr-2 h-5 w-5" />
                Buat Request Replacement
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-gray-50 dark:bg-slate-800/50 border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 dark:text-slate-100">Informasi Penting</p>
                <p className="text-sm text-muted-foreground">
                  Pilih <strong>Request Repair</strong> jika kaset mengalami masalah atau kerusakan yang memerlukan perbaikan segera.
                  {isHitachi && (
                    <> Pilih <strong>Request PM</strong> untuk perawatan rutin dan pencegahan kerusakan di masa mendatang.</>
                  )}
                  Pilih <strong>Request Replacement</strong> jika kaset tidak dapat diperbaiki dan perlu diganti dengan kaset baru.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

