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
import Link from 'next/link';

export default function RepairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const repairId = params.id as string;
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [repair, setRepair] = useState<any>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  
  // Update form state
  const [updateStatus, setUpdateStatus] = useState('');
  const [repairActionTaken, setRepairActionTaken] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [notes, setNotes] = useState('');
  
  // Complete form state
  const [completeRepairActionTaken, setCompleteRepairActionTaken] = useState('');
  const [completePartsReplaced, setCompletePartsReplaced] = useState('');
  const [qcPassed, setQcPassed] = useState<boolean | null>(null);
  
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
    const fetchRepair = async () => {
      if (!isAuthenticated || !repairId) return;

      try {
        const response = await api.get(`/repairs/${repairId}`);
        setRepair(response.data);
        setUpdateStatus(response.data.status);
        setRepairActionTaken(response.data.repairActionTaken || '');
        setPartsReplaced(Array.isArray(response.data.partsReplaced) ? response.data.partsReplaced.join(', ') : response.data.partsReplaced || '');
        setNotes(response.data.notes || '');
      } catch (error: any) {
        console.error('Error fetching repair:', error);
        setError(error.response?.data?.message || 'Failed to load repair ticket');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && repairId) {
      fetchRepair();
    }
  }, [isAuthenticated, repairId]);

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading repair ticket...</p>
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

  if (!repair) {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{error || 'Repair ticket not found'}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/repairs')}>
              Back to Repairs
            </Button>
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const partsArray = partsReplaced.trim() ? partsReplaced.split(',').map(p => p.trim()).filter(p => p) : undefined;
      
      await api.patch(`/repairs/${repairId}`, {
        status: updateStatus,
        repairActionTaken: repairActionTaken.trim() || undefined,
        partsReplaced: partsArray,
        notes: notes.trim() || undefined,
      });

      setSuccess('Repair ticket updated successfully');
      setShowUpdateForm(false);
      
      // Refresh repair data
      const response = await api.get(`/repairs/${repairId}`);
      setRepair(response.data);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update repair ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (qcPassed === null) {
      setError('Please select QC status');
      return;
    }

    if (!completeRepairActionTaken.trim()) {
      setError('Repair action taken is required');
      return;
    }

    setSubmitting(true);

    try {
      const partsArray = completePartsReplaced.trim() ? completePartsReplaced.split(',').map(p => p.trim()).filter(p => p) : undefined;
      
      await api.post(`/repairs/${repairId}/complete`, {
        repairActionTaken: completeRepairActionTaken.trim(),
        partsReplaced: partsArray,
        qcPassed,
      });

      setSuccess('Repair completed successfully! Ticket status updated to RESOLVED.');
      setShowCompleteForm(false);
      
      // Refresh repair data
      const response = await api.get(`/repairs/${repairId}`);
      setRepair(response.data);
      
      setTimeout(() => {
        setSuccess('');
        router.push('/repairs');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete repair');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repair Ticket Detail</h1>
            <p className="text-muted-foreground mt-2">
              Manage repair process and QC
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/repairs')}>
            Back to Repairs
          </Button>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Repair Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-mono">
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
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Reported Issue:</p>
                <p className="text-sm text-muted-foreground">{repair.reportedIssue}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Received At</p>
                  <p className="font-medium">
                    {repair.receivedAtRc ? formatDateTime(repair.receivedAtRc) : 'N/A'}
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

              {repair.repairActionTaken && (
                <div>
                  <p className="text-sm font-medium mb-1">Repair Action Taken:</p>
                  <p className="text-sm text-muted-foreground">{repair.repairActionTaken}</p>
                </div>
              )}

              {repair.partsReplaced && (
                <div>
                  <p className="text-sm font-medium mb-1">Parts Replaced:</p>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(repair.partsReplaced)
                      ? repair.partsReplaced.join(', ')
                      : repair.partsReplaced}
                  </p>
                </div>
              )}

              {repair.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{repair.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {repair.status !== 'COMPLETED' && (
          <div className="flex gap-4">
            {!showUpdateForm && !showCompleteForm && (
              <>
                <Button onClick={() => setShowUpdateForm(true)} variant="outline">
                  Update Status
                </Button>
                {repair.status !== 'COMPLETED' && (
                  <Button onClick={() => setShowCompleteForm(true)}>
                    Complete Repair & QC
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Update Form */}
        {showUpdateForm && repair.status !== 'COMPLETED' && (
          <Card>
            <CardHeader>
              <CardTitle>Update Repair Status</CardTitle>
              <CardDescription>Update repair ticket status and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="updateStatus">Status *</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEIVED">Received</SelectItem>
                      <SelectItem value="DIAGNOSING">Diagnosing</SelectItem>
                      <SelectItem value="WAITING_PARTS">Waiting Parts</SelectItem>
                      <SelectItem value="COMPLETED" disabled>Completed (Use Complete Repair button)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repairActionTaken">Repair Action Taken</Label>
                  <Textarea
                    id="repairActionTaken"
                    placeholder="e.g., Replaced sensor belt, recalibrated unit"
                    value={repairActionTaken}
                    onChange={(e) => setRepairActionTaken(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partsReplaced">Parts Replaced (comma-separated)</Label>
                  <Input
                    id="partsReplaced"
                    placeholder="e.g., Sensor Belt SB-100, Roller Kit RK-50"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the repair"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Repair'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Complete Form */}
        {showCompleteForm && repair.status !== 'COMPLETED' && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Repair & QC</CardTitle>
              <CardDescription>
                Complete repair process and perform QC. If QC passed, cassette returns to OK status and ticket status becomes RESOLVED.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleComplete} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="completeRepairActionTaken">Repair Action Taken *</Label>
                  <Textarea
                    id="completeRepairActionTaken"
                    placeholder="e.g., Replaced sensor belt and recalibrated unit"
                    value={completeRepairActionTaken}
                    onChange={(e) => setCompleteRepairActionTaken(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completePartsReplaced">Parts Replaced (comma-separated)</Label>
                  <Input
                    id="completePartsReplaced"
                    placeholder="e.g., Sensor Belt SB-100, Roller Kit RK-50"
                    value={completePartsReplaced}
                    onChange={(e) => setCompletePartsReplaced(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qcPassed">QC Status *</Label>
                  <Select
                    value={qcPassed === null ? '' : qcPassed.toString()}
                    onValueChange={(value) => setQcPassed(value === 'true')}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select QC status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">✅ Passed</SelectItem>
                      <SelectItem value="false">❌ Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {qcPassed === true && 'Cassette will return to OK status and ticket status will become RESOLVED'}
                    {qcPassed === false && 'Cassette will be marked as SCRAPPED'}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Completing...' : 'Complete Repair'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCompleteForm(false);
                      setError('');
                      setSuccess('');
                      setQcPassed(null);
                      setCompleteRepairActionTaken('');
                      setCompletePartsReplaced('');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
