'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function RepairsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.get('/repairs');
        setRepairs(response.data);
      } catch (error) {
        console.error('Error fetching repairs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.userType === 'HITACHI') {
      fetchRepairs();
    }
  }, [isAuthenticated, user]);

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading repairs...</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'DIAGNOSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'WAITING_PARTS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Repair Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage cassette repairs and QC process
        </p>
      </div>

      {repairs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No repair tickets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {repairs.map((repair) => (
            <Card key={repair.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-mono">
                      {repair.cassette?.serialNumber}
                    </CardTitle>
                    <CardDescription>
                      {repair.cassette?.cassetteType?.typeCode || 'N/A'}
                      {repair.cassette?.cassetteType?.typeCode && repair.cassette?.cassetteType?.typeName && (
                        <span className="text-xs ml-1">({repair.cassette.cassetteType.typeName})</span>
                      )}
                      {' • '}
                      {repair.cassette?.customerBank?.bankName}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      repair.status,
                    )}`}
                  >
                    {repair.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">Reported Issue:</p>
                  <p className="text-sm text-muted-foreground">{repair.reportedIssue}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground">Received At</p>
                    <p className="font-medium">
                      {repair.receivedAtRc
                        ? formatDateTime(repair.receivedAtRc)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Repaired By</p>
                    <p className="font-medium">
                      {repair.repairer?.fullName || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">QC Status</p>
                    <p className="font-medium">
                      {repair.qcPassed === null
                        ? 'Pending'
                        : repair.qcPassed
                          ? '✅ Passed'
                          : '❌ Failed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed At</p>
                    <p className="font-medium">
                      {repair.completedAt ? formatDateTime(repair.completedAt) : 'In progress'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Link href={`/repairs/${repair.id}`}>
                    <Button size="sm" variant="outline">
                      {repair.status === 'COMPLETED' ? 'View Details' : 'Manage Repair'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

