'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Package,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Wrench,
  AlertCircle,
  Loader2,
  FileText,
  Building2,
} from 'lucide-react';

export default function RepairDetailPage() {
  const router = useRouter();
  const params = useParams();
  const repairId = params.id as string;
  const { user, isAuthenticated, isLoading, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [repair, setRepair] = useState<any>(null);
  const [activeForm, setActiveForm] = useState<'none' | 'update' | 'complete'>('none');
  
  // Update form
  const [updateStatus, setUpdateStatus] = useState('');
  const [repairActionTaken, setRepairActionTaken] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [notes, setNotes] = useState('');
  
  // Complete form
  const [completeRepairActionTaken, setCompleteRepairActionTaken] = useState('');
  const [completePartsReplaced, setCompletePartsReplaced] = useState('');
  const [qcPassed, setQcPassed] = useState<boolean | null>(null);
  
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

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
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load repair' });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && repairId) {
      fetchRepair();
    }
  }, [isAuthenticated, repairId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const partsArray = partsReplaced.trim() ? partsReplaced.split(',').map(p => p.trim()).filter(p => p) : undefined;
      
      await api.patch(`/repairs/${repairId}`, {
        status: updateStatus,
        repairActionTaken: repairActionTaken.trim() || undefined,
        partsReplaced: partsArray,
        notes: notes.trim() || undefined,
      });

      setMessage({ type: 'success', text: '✅ Status berhasil diupdate!' });
      setActiveForm('none');
      
      const response = await api.get(`/repairs/${repairId}`);
      setRepair(response.data);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal update repair' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (qcPassed === null) {
      setMessage({ type: 'error', text: 'Pilih status QC!' });
      return;
    }

    if (!completeRepairActionTaken.trim()) {
      setMessage({ type: 'error', text: 'Repair action harus diisi!' });
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

      setMessage({ type: 'success', text: '✅ Repair selesai! Redirect ke list...' });
      
      setTimeout(() => {
        router.push('/repairs');
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal complete repair' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: string; icon: any }> = {
      RECEIVED: { label: 'Received', variant: 'bg-[#2563EB] text-white', icon: Package },
      DIAGNOSING: { label: 'Diagnosing', variant: 'bg-yellow-500 text-white', icon: AlertCircle },
      WAITING_PARTS: { label: 'Waiting Parts', variant: 'bg-orange-500 text-white', icon: Clock },
      COMPLETED: { label: 'Completed', variant: 'bg-green-500 text-white', icon: CheckCircle2 },
    };
    return configs[status] || { label: status, variant: 'bg-gray-500 text-white', icon: FileText };
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

  if (!isAuthenticated || user?.userType !== 'HITACHI') {
    return (
      <PageLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Access denied. RC Staff only.</p>
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
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Repair ticket tidak ditemukan</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/repairs')}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const statusBadge = getStatusBadge(repair.status);
  const StatusIcon = statusBadge.icon;
  const statusSteps = ['RECEIVED', 'DIAGNOSING', 'WAITING_PARTS', 'COMPLETED'];
  const currentStepIndex = statusSteps.indexOf(repair.status);

  return (
    <PageLayout>
      {/* Compact Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF]">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Repair Ticket</h1>
            <p className="text-sm text-gray-600 mt-1 font-mono font-bold">
              {repair.cassette?.serialNumber || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          message.type === 'error' 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Progress Bar */}
      <Card className="mb-6 border-2">
        <CardContent className="py-4">
          <div className="relative pt-2">
            <div className="flex justify-between mb-8">
              {statusSteps.map((status, index) => {
                const isActive = currentStepIndex === index;
                const isPassed = currentStepIndex > index;
                const stepIcons = [Package, AlertCircle, Clock, CheckCircle2];
                const StepIcon = stepIcons[index];
                
                return (
                  <div key={status} className="flex flex-col items-center flex-1 relative">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10
                      ${isActive ? 'bg-[#2563EB] text-white ring-4 ring-blue-200 scale-110' :
                        isPassed ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-500'}
                    `}>
                      {isPassed && !isActive ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span className={`text-[10px] mt-2 text-center font-medium max-w-[70px] leading-tight
                      ${isActive ? 'text-[#2563EB] font-bold' : isPassed ? 'text-green-600' : 'text-gray-400'}
                    `}>
                      {status === 'RECEIVED' ? 'Received' :
                       status === 'DIAGNOSING' ? 'Diagnosing' :
                       status === 'WAITING_PARTS' ? 'Waiting' : 'Done'}
                    </span>
                    {index < statusSteps.length - 1 && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Cards - 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoBlock icon={Package} iconColor="text-[#0EA5E9]" title="CASSETTE">
                  <InfoItem label="SN" value={repair.cassette?.serialNumber || 'N/A'} mono />
                  {repair.cassette?.cassetteType && (
                    <InfoItem label="Type" value={repair.cassette.cassetteType.typeCode} />
                  )}
                </InfoBlock>

                <InfoBlock icon={Building2} iconColor="text-green-600" title="BANK">
                  <InfoItem label="Name" value={repair.cassette?.customerBank?.bankName || 'N/A'} />
                  {repair.cassette?.customerBank?.bankCode && (
                    <InfoItem label="Code" value={repair.cassette.customerBank.bankCode} />
                  )}
                </InfoBlock>

                <InfoBlock icon={User} iconColor="text-orange-600" title="REPAIRER">
                  <InfoItem label="Name" value={repair.repairer?.fullName || 'Not assigned'} />
                  {repair.repairer?.role && (
                    <InfoItem label="Role" value={repair.repairer.role} />
                  )}
                </InfoBlock>

                <InfoBlock icon={Clock} iconColor="text-gray-600" title="TIME">
                  <InfoItem 
                    label="Received" 
                    value={repair.receivedAtRc ? new Date(repair.receivedAtRc).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'N/A'} 
                  />
                  <InfoItem 
                    label="QC" 
                    value={repair.qcPassed === null ? '⏳ Pending' : repair.qcPassed ? '✅ Pass' : '❌ Fail'} 
                  />
                </InfoBlock>
              </div>

              {repair.reportedIssue && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-semibold mb-1">REPORTED ISSUE</p>
                  <p className="text-sm text-gray-700">{repair.reportedIssue}</p>
                </div>
              )}

              {repair.repairActionTaken && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-semibold mb-1">REPAIR ACTION</p>
                  <p className="text-sm text-gray-700">{repair.repairActionTaken}</p>
                </div>
              )}

              {repair.partsReplaced && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-semibold mb-1">PARTS REPLACED</p>
                  <p className="text-sm text-gray-700">
                    {Array.isArray(repair.partsReplaced) ? repair.partsReplaced.join(', ') : repair.partsReplaced}
                  </p>
                </div>
              )}

              {repair.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-semibold mb-1">NOTES</p>
                  <p className="text-sm text-gray-700">{repair.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forms */}
          {activeForm === 'update' && (
            <Card className="border-2 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Update Status</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">STATUS *</label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECEIVED">📦 Received</SelectItem>
                        <SelectItem value="DIAGNOSING">⚠️ Diagnosing</SelectItem>
                        <SelectItem value="WAITING_PARTS">🕐 Waiting Parts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">REPAIR ACTION</label>
                    <Textarea
                      placeholder="Describe actions taken..."
                      value={repairActionTaken}
                      onChange={(e) => setRepairActionTaken(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">PARTS (comma-separated)</label>
                    <Input
                      placeholder="Sensor Belt SB-100, Roller RK-50"
                      value={partsReplaced}
                      onChange={(e) => setPartsReplaced(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">NOTES</label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Update'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setActiveForm('none')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeForm === 'complete' && (
            <Card className="border-2 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">Complete & QC</h3>
                <form onSubmit={handleComplete} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">REPAIR ACTION *</label>
                    <Textarea
                      placeholder="Final repair actions..."
                      value={completeRepairActionTaken}
                      onChange={(e) => setCompleteRepairActionTaken(e.target.value)}
                      rows={3}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">PARTS (comma-separated)</label>
                    <Input
                      placeholder="Sensor Belt SB-100, Roller RK-50"
                      value={completePartsReplaced}
                      onChange={(e) => setCompletePartsReplaced(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2">QC STATUS *</label>
                    <Select
                      value={qcPassed === null ? '' : qcPassed.toString()}
                      onValueChange={(value) => setQcPassed(value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select QC result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">✅ Passed → Cassette OK</SelectItem>
                        <SelectItem value="false">❌ Failed → Cassette Scrapped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={submitting} className="flex-1 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white">
                      {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : 'Complete'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setActiveForm('none'); setQcPassed(null); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div>
          {repair.status !== 'COMPLETED' && activeForm === 'none' && (
            <Card className="border-2 border-blue-200 bg-blue-50/30 sticky top-6">
              <CardContent className="p-6 space-y-3">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <Wrench className="h-8 w-8 text-[#E60012]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Actions</h3>
                </div>

                <Button onClick={() => setActiveForm('update')} className="w-full bg-[#E60012] hover:bg-[#C5000F] text-white">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Update Status
                </Button>

                <Button onClick={() => setActiveForm('complete')} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete & QC
                </Button>
              </CardContent>
            </Card>
          )}

          {repair.status === 'COMPLETED' && (
            <Card className="border-2 border-green-200 bg-green-50/30 sticky top-6">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-green-900">Repair Completed</p>
                <p className="text-sm text-gray-600 mt-2">
                  QC: {repair.qcPassed ? '✅ Passed' : '❌ Failed'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

// Helper Components
const InfoBlock = ({ icon: Icon, iconColor, title, children }: any) => (
  <div className="space-y-2">
    <div className={`flex items-center gap-1.5 ${iconColor} mb-2`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-bold">{title}</span>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value, mono = false }: any) => (
  <div>
    <p className="text-[10px] text-gray-500">{label}</p>
    <p className={`text-xs font-medium ${mono ? 'font-mono' : ''}`}>
      {value}
    </p>
  </div>
);

