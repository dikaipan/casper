'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserPlus,
  Building2,
  Truck,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Info,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function UsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('hitachi');
  const [hitachiUsers, setHitachiUsers] = useState<any[]>([]);
  const [pengelola, setPengelola] = useState<any[]>([]);
  const [selectedPengelola, setSelectedPengelola] = useState<string>('');
  const [pengelolaUsers, setPengelolaUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: '',
    department: '',
    pengelolaId: '',
    phone: '',
    whatsappNumber: '',
    employeeId: '',
    canCreateTickets: true,
    canCloseTickets: false,
    canManageMachines: false,
    assignedBranches: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'hitachi') {
        const res = await api.get('/auth/hitachi-users');
        setHitachiUsers(res.data || []);
      } else {
        // Fetch pengelola
        const pengelolaRes = await api.get('/pengelola');
        setPengelola(pengelolaRes.data || []);
        
        // Fetch pengelola users if pengelola is selected
        if (selectedPengelola) {
          try {
            const usersRes = await api.get(`/pengelola/${selectedPengelola}/users`);
            setPengelolaUsers(usersRes.data || []);
          } catch (error) {
            setPengelolaUsers([]);
          }
        } else {
          setPengelolaUsers([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedPengelola]);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchData();
    }
  }, [user, isAuthenticated, activeTab, selectedPengelola, fetchData]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: '',
      department: '',
      pengelolaId: '',
      phone: '',
      whatsappNumber: '',
      employeeId: '',
      canCreateTickets: true,
      canCloseTickets: false,
      canManageMachines: false,
      assignedBranches: '',
    });
    setEditingUser(null);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    if (activeTab === 'hitachi') {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        pengelolaId: '',
        phone: '',
        whatsappNumber: '',
        employeeId: '',
        canCreateTickets: true,
        canCloseTickets: false,
        canManageMachines: false,
        assignedBranches: '',
      });
    } else {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        role: user.role,
        department: '',
        pengelolaId: selectedPengelola,
        phone: user.phone || '',
        whatsappNumber: user.whatsappNumber || '',
        employeeId: user.employeeId || '',
        canCreateTickets: user.canCreateTickets ?? true,
        canCloseTickets: user.canCloseTickets ?? false,
        canManageMachines: user.canManageMachines ?? false,
        assignedBranches: Array.isArray(user.assignedBranches) 
          ? user.assignedBranches.join(', ') 
          : '',
      });
    }
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: any) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    setSubmitting(true);

    try {
      if (activeTab === 'hitachi') {
        await api.delete(`/auth/hitachi-users/${deletingUser.id}`);
      } else {
        await api.delete(`/pengelola/${selectedPengelola}/users/${deletingUser.id}`);
      }
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        if (activeTab === 'hitachi') {
          updateData.role = formData.role;
          updateData.department = formData.department;
          await api.patch(`/auth/hitachi-users/${editingUser.id}`, updateData);
        } else {
          updateData.role = formData.role;
          updateData.phone = formData.phone;
          updateData.whatsappNumber = formData.whatsappNumber;
          updateData.employeeId = formData.employeeId;
          updateData.canCreateTickets = formData.canCreateTickets;
          updateData.canCloseTickets = formData.canCloseTickets;
          updateData.canManageMachines = formData.canManageMachines;
          updateData.assignedBranches = formData.assignedBranches
            ? formData.assignedBranches.split(',').map((b) => b.trim())
            : undefined;
            await api.patch(`/pengelola/${selectedPengelola}/users/${editingUser.id}`, updateData);
        }
      } else {
        // Create new user
        if (activeTab === 'hitachi') {
          await api.post('/auth/hitachi-users', {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            role: formData.role,
            department: formData.department,
          });
        } else {
          if (!formData.pengelolaId) {
            alert('Please select a pengelola');
            return;
          }
          await api.post(`/pengelola/${formData.pengelolaId}/users`, {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone,
            whatsappNumber: formData.whatsappNumber,
            employeeId: formData.employeeId,
            role: formData.role,
            canCreateTickets: formData.canCreateTickets,
            canCloseTickets: formData.canCloseTickets,
            canManageMachines: formData.canManageMachines,
            assignedBranches: formData.assignedBranches
              ? formData.assignedBranches.split(',').map((b) => b.trim())
              : undefined,
          });
        }
      }

      resetForm();
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-teal-400" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Add {activeTab === 'hitachi' ? 'Hitachi' : 'Pengelola'} User
                </DialogTitle>
                <DialogDescription>
                  Create a new user account. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'pengelola' && (
                  <div className="space-y-2">
                    <Label htmlFor="pengelolaId">Pengelola *</Label>
                    <Select
                      value={formData.pengelolaId}
                      onValueChange={(value) => setFormData({ ...formData, pengelolaId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pengelola" />
                      </SelectTrigger>
                      <SelectContent>
                        {pengelola.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.companyName} ({p.pengelolaCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                {activeTab === 'hitachi' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="RC_MANAGER">RC Manager</SelectItem>
                            <SelectItem value="RC_STAFF">RC Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.role && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-[#2563EB] dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-[#1E40AF] dark:text-blue-300">
                                {formData.role === 'SUPER_ADMIN' && (
                                  <div>
                                    <p className="font-semibold mb-1">Super Admin:</p>
                                    <p>Akses penuh ke semua fitur sistem termasuk user management, banks, pengelola, machines, cassettes, tickets, repairs, dan import data.</p>
                                  </div>
                                )}
                                {formData.role === 'RC_MANAGER' && (
                                  <div>
                                    <p className="font-semibold mb-1">RC Manager:</p>
                                    <p>Dapat melihat semua data dan mengelola repair tickets serta problem tickets. Tidak dapat create/update user, bank, pengelola, atau machine.</p>
                                  </div>
                                )}
                                {formData.role === 'RC_STAFF' && (
                                  <div>
                                    <p className="font-semibold mb-1">RC Staff:</p>
                                    <p>Staff operasional yang menangani repair cassette dan update status ticket. Dapat melihat semua data untuk referensi.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => setFormData({ ...formData, department: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REPAIR_CENTER">Repair Center</SelectItem>
                            <SelectItem value="MANAGEMENT">Management</SelectItem>
                            <SelectItem value="LOGISTICS">Logistics</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TECHNICIAN">Technician</SelectItem>
                            <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.role && (
                          <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-md border border-rose-200 dark:border-rose-800">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-rose-800 dark:text-rose-300">
                                {formData.role === 'ADMIN' && (
                                  <div>
                                    <p className="font-semibold mb-1">Admin:</p>
                                    <p>Dapat mengelola user di pengelola mereka dan memiliki akses penuh ke semua data pengelola (machines, cassettes, tickets).</p>
                                  </div>
                                )}
                                {formData.role === 'SUPERVISOR' && (
                                  <div>
                                    <p className="font-semibold mb-1">Supervisor:</p>
                                    <p>Dapat melihat dan monitoring semua data pengelola untuk supervise tim. Tidak dapat mengelola user.</p>
                                  </div>
                                )}
                                {formData.role === 'TECHNICIAN' && (
                                  <div>
                                    <p className="font-semibold mb-1">Technician:</p>
                                    <p>Staff lapangan yang melakukan maintenance. Akses dapat dibatasi per branch menggunakan &quot;Assigned Branches&quot;. Jika kosong, dapat akses semua branches pengelola.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <Input
                          id="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assignedBranches">Assigned Branches (comma-separated)</Label>
                      <Input
                        id="assignedBranches"
                        placeholder="BNI-JKT-SUDIRMAN, BNI-JKT-THAMRIN"
                        value={formData.assignedBranches}
                        onChange={(e) => setFormData({ ...formData, assignedBranches: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Leave empty for admin to access all branches
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Edit {activeTab === 'hitachi' ? 'Hitachi' : 'Pengelola'} User
                </DialogTitle>
                <DialogDescription>
                  Update user information. Leave password empty to keep current password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'pengelola' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-pengelolaId">Pengelola *</Label>
                    <Select
                      value={formData.pengelolaId}
                      onValueChange={(value) => setFormData({ ...formData, pengelolaId: value })}
                      required
                      disabled
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pengelola" />
                      </SelectTrigger>
                      <SelectContent>
                        {pengelola.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.companyName} ({p.pengelolaCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username *</Label>
                    <Input
                      id="edit-username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password or leave empty"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Full Name *</Label>
                  <Input
                    id="edit-fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                {activeTab === 'hitachi' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="RC_MANAGER">RC Manager</SelectItem>
                            <SelectItem value="RC_STAFF">RC Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.role && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-[#2563EB] dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-[#1E40AF] dark:text-blue-300">
                                {formData.role === 'SUPER_ADMIN' && (
                                  <div>
                                    <p className="font-semibold mb-1">Super Admin:</p>
                                    <p>Akses penuh ke semua fitur sistem termasuk user management, banks, pengelola, machines, cassettes, tickets, repairs, dan import data.</p>
                                  </div>
                                )}
                                {formData.role === 'RC_MANAGER' && (
                                  <div>
                                    <p className="font-semibold mb-1">RC Manager:</p>
                                    <p>Dapat melihat semua data dan mengelola repair tickets serta problem tickets. Tidak dapat create/update user, bank, pengelola, atau machine.</p>
                                  </div>
                                )}
                                {formData.role === 'RC_STAFF' && (
                                  <div>
                                    <p className="font-semibold mb-1">RC Staff:</p>
                                    <p>Staff operasional yang menangani repair cassette dan update status ticket. Dapat melihat semua data untuk referensi.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-department">Department *</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => setFormData({ ...formData, department: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="REPAIR_CENTER">Repair Center</SelectItem>
                            <SelectItem value="MANAGEMENT">Management</SelectItem>
                            <SelectItem value="LOGISTICS">Logistics</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-role">Role *</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TECHNICIAN">Technician</SelectItem>
                            <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.role && (
                          <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-md border border-rose-200 dark:border-rose-800">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-rose-800 dark:text-rose-300">
                                {formData.role === 'ADMIN' && (
                                  <div>
                                    <p className="font-semibold mb-1">Admin:</p>
                                    <p>Dapat mengelola user di pengelola mereka dan memiliki akses penuh ke semua data pengelola (machines, cassettes, tickets).</p>
                                  </div>
                                )}
                                {formData.role === 'SUPERVISOR' && (
                                  <div>
                                    <p className="font-semibold mb-1">Supervisor:</p>
                                    <p>Dapat melihat dan monitoring semua data pengelola untuk supervise tim. Tidak dapat mengelola user.</p>
                                  </div>
                                )}
                                {formData.role === 'TECHNICIAN' && (
                                  <div>
                                    <p className="font-semibold mb-1">Technician:</p>
                                    <p>Staff lapangan yang melakukan maintenance. Akses dapat dibatasi per branch menggunakan &quot;Assigned Branches&quot;. Jika kosong, dapat akses semua branches pengelola.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-employeeId">Employee ID</Label>
                        <Input
                          id="edit-employeeId"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                          id="edit-phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-whatsappNumber">WhatsApp Number</Label>
                        <Input
                          id="edit-whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-assignedBranches">Assigned Branches (comma-separated)</Label>
                      <Input
                        id="edit-assignedBranches"
                        placeholder="BNI-JKT-SUDIRMAN, BNI-JKT-THAMRIN"
                        value={formData.assignedBranches}
                        onChange={(e) => setFormData({ ...formData, assignedBranches: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      resetForm();
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update User'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account
                  {deletingUser && ` "${deletingUser.username}"`}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="hitachi" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Hitachi Users</span>
            </TabsTrigger>
            <TabsTrigger value="pengelola" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Pengelola Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hitachi" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hitachi Users</CardTitle>
                    <CardDescription>Manage Repair Center and Management staff</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white dark:from-teal-500 dark:to-teal-600 dark:hover:from-teal-600 dark:hover:to-teal-700"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add Hitachi User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-teal-400" />
                  </div>
                ) : hitachiUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                    <p>No Hitachi users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Username</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Full Name</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Email</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Role</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Department</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Status</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hitachiUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.username}</td>
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.fullName}</td>
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.email}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-[#E60012] dark:text-red-400">
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.department}</td>
                            <td className="p-3">
                              {user.status === 'ACTIVE' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(user)}
                                  className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pengelola" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pengelola Users</CardTitle>
                    <CardDescription>Manage pengelola technician and staff accounts</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white dark:from-teal-500 dark:to-teal-600 dark:hover:from-teal-600 dark:hover:to-teal-700"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add Pengelola User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="pengelolaSelect">Select Pengelola</Label>
                  <Select value={selectedPengelola} onValueChange={setSelectedPengelola}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a pengelola to view users" />
                    </SelectTrigger>
                    <SelectContent>
                      {pengelola.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.companyName} ({p.pengelolaCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2563EB] dark:text-teal-400" />
                  </div>
                ) : !selectedPengelola ? (
                  <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                    <p>Please select a pengelola to view users</p>
                  </div>
                ) : pengelolaUsers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                    <p>No users found for this pengelola</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Username</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Full Name</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Email</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Role</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Status</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-slate-100">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pengelolaUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.username}</td>
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.fullName}</td>
                            <td className="p-3 text-gray-900 dark:text-slate-100">{user.email}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400">
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3">
                              {user.status === 'ACTIVE' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(user)}
                                  className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

