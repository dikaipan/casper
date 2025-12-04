'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ImportPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  
  // Machine-Cassettes CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bankCode, setBankCode] = useState('BNI001');
  const [pengelolaCode, setPengelolaCode] = useState('PGL-TAG-001');
  const [banks, setBanks] = useState<any[]>([]);
  const [pengelola, setPengelola] = useState<any[]>([]);
  const [loadingBanksPengelola, setLoadingBanksPengelola] = useState(false);

  // Example template
  const exampleTemplate = {
    banks: [
      {
        bankCode: 'BNI001',
        bankName: 'PT Bank Negara Indonesia',
        branchCode: 'BNI-JKT-001',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        address: 'Jl. Sudirman No. 1',
        contactPerson: 'John Doe',
        contactPhone: '021-12345678',
        contactEmail: 'contact@bni.co.id',
        notes: 'Head Office',
      },
    ],
    cassettes: [
      {
        serialNumber: 'RB-BNI-0001',
        cassetteTypeCode: 'RB',
        customerBankCode: 'BNI001',
        status: 'OK',
        purchaseDate: '2024-01-15',
        warrantyExpiryDate: '2026-01-15',
        notes: 'Spare cassette',
      },
    ],
  };

  const handleLoadExample = () => {
    setJsonData(JSON.stringify(exampleTemplate, null, 2));
    setError('');
    setResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isJson = fileName.endsWith('.json');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isJson && !isExcel) {
      setError('Please upload a valid JSON or Excel file (.json, .xlsx, .xls)');
      return;
    }

    // Handle Excel file - upload directly
    if (isExcel) {
      setError('');
      setResult(null);
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/import/excel', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setResult(response.data);
        setJsonData(''); // Clear JSON textarea for Excel upload
      } catch (err: any) {
        console.error('Excel import error:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to import Excel file. Please check the format.',
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle JSON file - parse and show in textarea
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setJsonData(JSON.stringify(parsed, null, 2));
        setError('');
        setResult(null);
      } catch (err) {
        setError('Invalid JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      // Parse JSON to validate
      const parsedData = JSON.parse(jsonData);

      // Validate structure
      if (!parsedData.banks && !parsedData.cassettes) {
        throw new Error('JSON must contain "banks" and/or "cassettes" arrays');
      }

      // Send to API
      const response = await api.post('/import/bulk', parsedData);
      setResult(response.data);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to import data. Please check your JSON format.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Load banks and pengelola for machine-cassettes import
  useEffect(() => {
    const loadBanksAndPengelola = async () => {
      if (!isAuthenticated || user?.userType !== 'HITACHI') return;
      
      setLoadingBanksPengelola(true);
      try {
        const [banksRes, pengelolaRes] = await Promise.all([
          api.get('/banks'),
          api.get('/pengelola'),
        ]);
        setBanks(banksRes.data || []);
        setPengelola(pengelolaRes.data || []);
      } catch (err) {
        console.error('Error loading banks/pengelola:', err);
      } finally {
        setLoadingBanksPengelola(false);
      }
    };
    loadBanksAndPengelola();
  }, [isAuthenticated, user]);

  // Handle machine-cassettes CSV import
  const handleMachineCassettesCSVUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await api.post(
        `/import/csv/machine-cassettes?bank_code=${bankCode}&pengelola_code=${pengelolaCode}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResult(response.data);
      setCsvFile(null);
    } catch (err: any) {
      console.error('Machine-Cassettes CSV import error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to import CSV file. Please check the format.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/import/csv/machine-cassettes/template', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'machine_cassettes_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
      setError('Failed to download template');
    }
  };

  if (isLoading) {
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
            <p className="text-muted-foreground">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Tabs defaultValue="banks-cassettes" className="max-w-4xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="banks-cassettes">Banks & Cassettes</TabsTrigger>
          <TabsTrigger value="machine-cassettes">Machine & Cassettes</TabsTrigger>
        </TabsList>

        {/* Banks & Cassettes Tab */}
        <TabsContent value="banks-cassettes" className="space-y-6 mt-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instructions</CardTitle>
            <CardDescription>How to bulk import data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Method 1 - Excel File (Recommended):</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Prepare Excel file with &quot;Banks&quot; and/or &quot;Cassettes&quot; sheets</li>
                <li>Upload Excel file (.xlsx or .xls)</li>
                <li>Data will be imported automatically</li>
              </ul>
            </div>
            <div>
              <strong>Method 2 - JSON File or Text:</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Prepare JSON file or paste JSON data</li>
                <li>Upload JSON file or paste below</li>
                <li>Click &quot;Import Data&quot; to start</li>
              </ul>
            </div>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLoadExample}>
                Load JSON Example
              </Button>
            </div>
            <div className="pt-2 p-3 bg-blue-50 rounded-md text-xs">
              <strong>💡 Excel Format:</strong> File harus punya sheet &quot;Banks&quot; dan/atau &quot;Cassettes&quot;. 
              Lihat dokumentasi untuk detail format kolom.
            </div>
          </CardContent>
        </Card>

        {/* Upload or Paste JSON */}
        <Card>
          <CardHeader>
            <CardTitle>Upload or Paste JSON Data</CardTitle>
            <CardDescription>
              Upload a JSON file or paste JSON data directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload JSON or Excel File</Label>
              <input
                id="file-upload"
                type="file"
                accept=".json,.xlsx,.xls,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: JSON (.json), Excel (.xlsx, .xls)
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground">OR</div>

            {/* JSON Textarea */}
            <div className="space-y-2">
              <Label htmlFor="json-data">Paste JSON Data</Label>
              <Textarea
                id="json-data"
                value={jsonData}
                onChange={(e) => {
                  setJsonData(e.target.value);
                  setError('');
                  setResult(null);
                }}
                placeholder='{ "banks": [...], "cassettes": [...] }'
                className="font-mono text-sm min-h-[400px]"
              />
              {jsonData && (
                <div className="text-xs text-muted-foreground">
                  {jsonData.split('\n').length} lines
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">❌ Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!jsonData.trim() || loading}
              className="w-full"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>
                {result.success ? '✅ Import Successful' : '⚠️ Import Completed with Errors'}
              </CardTitle>
              <CardDescription>Import results summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Banks Results */}
              {result.banks && (
                <div className="space-y-2">
                  <h3 className="font-semibold">🏦 Banks</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold">{result.banks.total}</div>
                    </div>
                    <div>
                      <div className="text-green-600">Successful</div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.banks.successful}
                      </div>
                    </div>
                    <div>
                      <div className="text-red-600">Failed</div>
                      <div className="text-2xl font-bold text-red-600">
                        {result.banks.failed}
                      </div>
                    </div>
                  </div>

                  {/* Failed Banks */}
                  {result.banks.failed > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-600 mb-2">Failed Banks:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.banks.results
                          .filter((r: any) => !r.success)
                          .map((r: any, idx: number) => (
                            <div key={idx} className="text-xs p-2 bg-red-50 rounded">
                              <strong>{r.bankCode}</strong>: {r.error}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cassettes Results */}
              {result.cassettes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">📦 Cassettes</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold">{result.cassettes.total}</div>
                    </div>
                    <div>
                      <div className="text-green-600">Successful</div>
                      <div className="text-2xl font-bold text-green-600">
                        {result.cassettes.successful}
                      </div>
                    </div>
                    <div>
                      <div className="text-red-600">Failed</div>
                      <div className="text-2xl font-bold text-red-600">
                        {result.cassettes.failed}
                      </div>
                    </div>
                  </div>

                  {/* Failed Cassettes */}
                  {result.cassettes.failed > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-600 mb-2">Failed Cassettes:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.cassettes.results
                          .filter((r: any) => !r.success)
                          .map((r: any, idx: number) => (
                            <div key={idx} className="text-xs p-2 bg-red-50 rounded">
                              <strong>{r.serialNumber}</strong>: {r.error}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Success Message */}
              {result.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-800">
                    ✅ All data imported successfully!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </TabsContent>

        {/* Machine & Cassettes Tab */}
        <TabsContent value="machine-cassettes" className="space-y-6 mt-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Instructions - Machine & Cassettes Import</CardTitle>
              <CardDescription>Import machines with 10 cassettes (5 main + 5 backup) from CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Format CSV (Sesuai File Excel):</strong>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                  <li>1 baris = 1 kaset</li>
                  <li>Kolom: SN Mesin, Attribute, SN Cassete (atau SN Mesin, SN Kaset)</li>
                  <li>1 mesin memiliki 10 kaset</li>
                  <li>SN Mesin hanya diisi di baris pertama, kemudian bisa kosong</li>
                  <li>Attribute: &quot;SN Kaset&quot;, &quot;SN Kaset Cadangan&quot;, atau &quot;Column1&quot; (header grup - akan di-skip)</li>
                  <li>Semua kaset digabungkan (tidak perlu bedakan utama/cadangan)</li>
                  <li>Auto-detect tipe kaset dari serial number</li>
                </ul>
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  📥 Download CSV Template
                </Button>
              </div>
              <div className="pt-2 p-3 bg-blue-50 rounded-md text-xs">
                <strong>💡 Format CSV (Sesuai File Excel):</strong><br/>
                <strong>Format 1 (dengan Attribute):</strong> SN Mesin, Attribute, SN Cassete<br/>
                <strong>Format 2 (sederhana):</strong> SN Mesin, SN Kaset<br/>
                <strong>Contoh Format 1:</strong><br/>
                <code className="block mt-1 p-1 bg-white rounded text-xs">
                  74UEA43N03-069520,Column1,1<br/>
                  ,SN Kaset,76UWAB2SW754319<br/>
                  ,SN Kaset Cadangan,76UWAB2SW751779<br/>
                  ... (10 baris kaset per mesin)
                </code>
                <strong>Catatan:</strong> SN Mesin bisa kosong di baris berikutnya, akan menggunakan SN Mesin dari baris sebelumnya. Baris dengan Attribute=&quot;Column1&quot; akan di-skip.
              </div>
            </CardContent>
          </Card>

          {/* CSV Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload CSV file with machine and cassette data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bank and Pengelola Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-code">Bank Code</Label>
                  <Select value={bankCode} onValueChange={setBankCode}>
                    <SelectTrigger id="bank-code">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.bankCode}>
                          {bank.bankCode} - {bank.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pengelola-code">Pengelola Code</Label>
                  <Select value={pengelolaCode} onValueChange={setPengelolaCode}>
                    <SelectTrigger id="pengelola-code">
                      <SelectValue placeholder="Select pengelola" />
                    </SelectTrigger>
                    <SelectContent>
                      {pengelola.map((p) => (
                        <SelectItem key={p.id} value={p.pengelolaCode}>
                          {p.pengelolaCode} - {p.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="csv-file-upload">Upload CSV File</Label>
                <input
                  id="csv-file-upload"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setCsvFile(file || null);
                    setError('');
                    setResult(null);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {csvFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800">❌ Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleMachineCassettesCSVUpload}
                disabled={!csvFile || loading || loadingBanksPengelola}
                className="w-full"
              >
                {loading ? 'Importing...' : 'Import Machine & Cassettes'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {result.success ? '✅ Import Successful' : '⚠️ Import Completed with Errors'}
                </CardTitle>
                <CardDescription>Import results summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Machines Results */}
                {result.machines && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">🖥️ Machines</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="text-2xl font-bold">{result.machines.total}</div>
                      </div>
                      <div>
                        <div className="text-green-600">Successful</div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.machines.successful}
                        </div>
                      </div>
                      <div>
                        <div className="text-red-600">Failed</div>
                        <div className="text-2xl font-bold text-red-600">
                          {result.machines.failed}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cassettes Results */}
                {result.cassettes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">📦 Cassettes</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="text-2xl font-bold">{result.cassettes.total}</div>
                      </div>
                      <div>
                        <div className="text-green-600">Successful</div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.cassettes.successful}
                        </div>
                      </div>
                      <div>
                        <div className="text-red-600">Failed</div>
                        <div className="text-2xl font-bold text-red-600">
                          {result.cassettes.failed}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {result.success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      ✅ All data imported successfully!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

