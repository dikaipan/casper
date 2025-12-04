# 🎨 Rekomendasi Peningkatan UI Import untuk User Non-Tech

## 🎯 **TUJUAN**

Membuat fitur import menjadi **super user-friendly** untuk user non-technical dengan:
- ✅ Step-by-step wizard
- ✅ Preview data sebelum import
- ✅ Validasi visual yang jelas
- ✅ Error messages yang mudah dipahami
- ✅ Template yang bisa langsung di-download
- ✅ Progress indicator yang jelas

---

## 🚀 **FITUR YANG PERLU DITAMBAHKAN**

### **1. STEP-BY-STEP WIZARD** ⭐⭐⭐ (PRIORITAS TINGGI)

**Masalah Saat Ini:**
- User langsung dihadapkan dengan form yang kompleks
- Tidak jelas harus mulai dari mana
- Tidak ada guidance

**Solusi: Wizard dengan 3-4 Steps**

```
┌─────────────────────────────────────────┐
│  Step 1: Pilih Metode Import           │
│  ○ Excel File (Recommended)            │
│  ○ CSV File                             │
│  ○ JSON (Advanced)                      │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Step 2: Upload File                    │
│  [Drag & Drop Area]                     │
│  atau [Choose File]                     │
│  ✅ File terpilih: import_data.xlsx     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Step 3: Preview & Validasi             │
│  📊 Preview Data:                        │
│  - 5 Banks ditemukan                    │
│  - 100 Cassettes ditemukan              │
│  ⚠️ 2 Errors ditemukan                   │
│  [Lihat Detail Errors]                  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Step 4: Konfirmasi & Import             │
│  ✅ Siap untuk import?                   │
│  [Import Data] [Cancel]                  │
└─────────────────────────────────────────┘
```

**Implementasi:**
```tsx
// Wizard Component
const ImportWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);

  return (
    <div className="wizard-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <StepIndicator step={1} current={currentStep} label="Pilih Metode" />
        <StepIndicator step={2} current={currentStep} label="Upload File" />
        <StepIndicator step={3} current={currentStep} label="Preview" />
        <StepIndicator step={4} current={currentStep} label="Import" />
      </div>

      {/* Step Content */}
      {currentStep === 1 && <SelectMethodStep />}
      {currentStep === 2 && <UploadFileStep />}
      {currentStep === 3 && <PreviewStep />}
      {currentStep === 4 && <ImportStep />}
    </div>
  );
};
```

---

### **2. DRAG & DROP UPLOAD AREA** ⭐⭐⭐ (PRIORITAS TINGGI)

**Masalah Saat Ini:**
- Hanya input file biasa
- Tidak user-friendly

**Solusi: Drag & Drop Zone yang Menarik**

```tsx
<Dropzone
  onDrop={(files) => handleFileSelect(files[0])}
  accept={{
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
  }}
>
  {({ getRootProps, getInputProps, isDragActive }) => (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-gray-300 hover:border-primary/50'
      )}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <>
          <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Lepaskan file di sini</p>
        </>
      ) : (
        <>
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            Drag & drop file Excel/CSV di sini
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            atau klik untuk memilih file
          </p>
          <p className="text-xs text-muted-foreground">
            Format yang didukung: .xlsx, .xls, .csv
          </p>
        </>
      )}
    </div>
  )}
</Dropzone>
```

**Features:**
- ✅ Visual feedback saat drag over
- ✅ Icon yang jelas
- ✅ Text yang informatif
- ✅ File size limit indicator

---

### **3. PREVIEW DATA SEBELUM IMPORT** ⭐⭐⭐ (PRIORITAS TINGGI)

**Masalah Saat Ini:**
- User tidak tahu data apa yang akan di-import
- Tidak ada preview sebelum submit

**Solusi: Preview Table dengan Validasi**

```tsx
const PreviewStep = ({ file, parsedData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Data</CardTitle>
        <CardDescription>
          Periksa data sebelum import. Pastikan semua data benar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Banks"
            value={parsedData.banks?.length || 0}
            icon={<Building2 />}
            status={getValidationStatus('banks')}
          />
          <StatCard
            label="Cassettes"
            value={parsedData.cassettes?.length || 0}
            icon={<Disc />}
            status={getValidationStatus('cassettes')}
          />
          <StatCard
            label="Errors"
            value={errors.length}
            icon={<AlertCircle />}
            status={errors.length > 0 ? 'error' : 'success'}
          />
        </div>

        {/* Preview Table */}
        <Tabs defaultValue="banks">
          <TabsList>
            <TabsTrigger value="banks">
              Banks ({parsedData.banks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="cassettes">
              Cassettes ({parsedData.cassettes?.length || 0})
            </TabsTrigger>
            {errors.length > 0 && (
              <TabsTrigger value="errors">
                Errors ({errors.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="banks">
            <PreviewTable
              data={parsedData.banks}
              columns={bankColumns}
              maxRows={10}
            />
          </TabsContent>

          <TabsContent value="cassettes">
            <PreviewTable
              data={parsedData.cassettes}
              columns={cassetteColumns}
              maxRows={10}
            />
          </TabsContent>

          <TabsContent value="errors">
            <ErrorList errors={errors} />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            ← Kembali
          </Button>
          <Button
            onClick={handleImport}
            disabled={errors.length > 0}
            className="flex-1"
          >
            {errors.length > 0
              ? `Perbaiki ${errors.length} Error Terlebih Dahulu`
              : 'Import Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

**Features:**
- ✅ Summary cards (total banks, cassettes, errors)
- ✅ Preview table (max 10 rows, dengan pagination)
- ✅ Error list dengan detail
- ✅ Highlight rows dengan error
- ✅ Disable import jika ada error

---

### **4. VALIDASI REAL-TIME** ⭐⭐ (PRIORITAS SEDANG)

**Masalah Saat Ini:**
- Validasi hanya setelah upload
- Error tidak jelas

**Solusi: Validasi Saat Parse File**

```tsx
const validateData = (data: ParsedData) => {
  const errors: ValidationError[] = [];

  // Validate Banks
  if (data.banks) {
    data.banks.forEach((bank, index) => {
      if (!bank.bankCode) {
        errors.push({
          type: 'bank',
          row: index + 2, // +2 karena header + 0-indexed
          field: 'BankCode',
          message: 'BankCode tidak boleh kosong',
          value: bank.bankCode,
        });
      }
      if (!bank.bankName) {
        errors.push({
          type: 'bank',
          row: index + 2,
          field: 'BankName',
          message: 'BankName tidak boleh kosong',
          value: bank.bankName,
        });
      }
      // Check duplicate
      const duplicates = data.banks.filter(b => b.bankCode === bank.bankCode);
      if (duplicates.length > 1) {
        errors.push({
          type: 'bank',
          row: index + 2,
          field: 'BankCode',
          message: `BankCode ${bank.bankCode} duplikat`,
          value: bank.bankCode,
        });
      }
    });
  }

  // Validate Cassettes
  if (data.cassettes) {
    data.cassettes.forEach((cassette, index) => {
      if (!cassette.serialNumber) {
        errors.push({
          type: 'cassette',
          row: index + 2,
          field: 'SerialNumber',
          message: 'SerialNumber tidak boleh kosong',
        });
      }
      if (!cassette.customerBankCode) {
        errors.push({
          type: 'cassette',
          row: index + 2,
          field: 'CustomerBankCode',
          message: 'CustomerBankCode tidak boleh kosong',
        });
      }
      // Check if bank exists
      const bankExists = data.banks?.some(
        b => b.bankCode === cassette.customerBankCode
      );
      if (!bankExists) {
        errors.push({
          type: 'cassette',
          row: index + 2,
          field: 'CustomerBankCode',
          message: `Bank ${cassette.customerBankCode} tidak ditemukan. Pastikan bank sudah diisi di sheet Banks.`,
          value: cassette.customerBankCode,
        });
      }
    });
  }

  return errors;
};
```

**Error Display:**
```tsx
const ErrorList = ({ errors }) => {
  return (
    <div className="space-y-2">
      {errors.map((error, index) => (
        <Alert key={index} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            Error di {error.type === 'bank' ? 'Sheet Banks' : 'Sheet Cassettes'}
            , Baris {error.row}
          </AlertTitle>
          <AlertDescription>
            <strong>{error.field}:</strong> {error.message}
            {error.value && (
              <span className="text-xs text-muted-foreground ml-2">
                (Nilai: {error.value})
              </span>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
```

---

### **5. TEMPLATE DOWNLOAD YANG MUDAH** ⭐⭐ (PRIORITAS SEDANG)

**Masalah Saat Ini:**
- Template mungkin tidak jelas
- Tidak ada contoh data

**Solusi: Template dengan Contoh Data & Instruksi**

```tsx
const TemplateDownloadCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📥 Download Template</CardTitle>
        <CardDescription>
          Download template Excel dengan contoh data dan instruksi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Options */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={downloadExcelTemplate}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <FileSpreadsheet className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Excel Template</div>
              <div className="text-xs text-muted-foreground">
                .xlsx dengan contoh data
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={downloadCSVTemplate}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <FileText className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">CSV Template</div>
              <div className="text-xs text-muted-foreground">
                .csv sederhana
              </div>
            </div>
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg text-sm">
          <strong>💡 Tips:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Template sudah berisi contoh data yang bisa dihapus</li>
            <li>Kolom dengan tanda ✅ adalah wajib diisi</li>
            <li>Kolom optional bisa dikosongkan</li>
            <li>Jangan hapus atau ubah nama sheet</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
```

**Backend: Generate Template dengan Contoh**
```typescript
// Backend: Generate Excel dengan contoh data
generateExcelTemplate(): Buffer {
  const workbook = XLSX.utils.book_new();
  
  // Sheet Banks dengan contoh
  const banksData = [
    ['BankCode', 'BankName', 'BranchCode', 'City', 'Province'],
    ['BNI001', 'PT Bank Negara Indonesia', 'BNI-JKT-001', 'Jakarta', 'DKI Jakarta'],
    ['BCA001', 'PT Bank Central Asia', 'BCA-JKT-001', 'Jakarta', 'DKI Jakarta'],
  ];
  const banksSheet = XLSX.utils.aoa_to_sheet(banksData);
  XLSX.utils.book_append_sheet(workbook, banksSheet, 'Banks');
  
  // Sheet Cassettes dengan contoh
  const cassettesData = [
    ['SerialNumber', 'CassetteTypeCode', 'CustomerBankCode', 'Status', 'Notes'],
    ['76UWRB2SB899406', 'RB', 'BNI001', 'OK', 'Kaset Utama'],
    ['76UWAB2SW754109', 'AB', 'BNI001', 'OK', 'Kaset Cadangan'],
  ];
  const cassettesSheet = XLSX.utils.aoa_to_sheet(cassettesData);
  XLSX.utils.book_append_sheet(workbook, cassettesSheet, 'Cassettes');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
```

---

### **6. PROGRESS INDICATOR YANG JELAS** ⭐⭐ (PRIORITAS SEDANG)

**Masalah Saat Ini:**
- Tidak jelas progress import
- User tidak tahu kapan selesai

**Solusi: Progress Bar dengan Detail**

```tsx
const ImportProgress = ({ progress, status }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing data...</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} />
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Processed</div>
              <div className="text-2xl font-bold">
                {progress.processed} / {progress.total}
              </div>
            </div>
            <div>
              <div className="text-green-600">Successful</div>
              <div className="text-2xl font-bold text-green-600">
                {progress.successful}
              </div>
            </div>
            <div>
              <div className="text-red-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">
                {progress.failed}
              </div>
            </div>
          </div>

          {/* Current Item */}
          {progress.currentItem && (
            <div className="text-sm text-muted-foreground">
              Processing: {progress.currentItem}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

**Backend: Streaming Progress (Optional)**
```typescript
// Backend: Stream progress via WebSocket atau Server-Sent Events
@Post('excel/stream')
async importExcelStream(
  @UploadedFile() file: Express.Multer.File,
  @Res() res: Response,
) {
  // Parse file
  const data = await parseExcel(file);
  
  // Stream progress
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  let processed = 0;
  const total = data.cassettes.length;
  
  for (const cassette of data.cassettes) {
    await importCassette(cassette);
    processed++;
    
    // Send progress
    res.write(`data: ${JSON.stringify({
      processed,
      total,
      percentage: Math.round((processed / total) * 100),
      currentItem: cassette.serialNumber,
    })}\n\n`);
  }
  
  res.end();
}
```

---

### **7. ERROR MESSAGES YANG JELAS** ⭐⭐⭐ (PRIORITAS TINGGI)

**Masalah Saat Ini:**
- Error messages mungkin terlalu teknis
- Tidak jelas cara memperbaiki

**Solusi: User-Friendly Error Messages**

```tsx
const ErrorMessage = ({ error }) => {
  const errorMessages = {
    'BANK_NOT_FOUND': {
      title: 'Bank Tidak Ditemukan',
      message: `Bank dengan kode "${error.bankCode}" tidak ditemukan di sistem.`,
      solution: [
        'Pastikan bank sudah diisi di sheet "Banks" terlebih dahulu',
        'Atau pastikan bank sudah terdaftar di sistem sebelum import cassettes',
        'Cek apakah BankCode sudah benar (case-sensitive)',
      ],
      icon: <Building2 className="h-5 w-5" />,
    },
    'DUPLICATE_SERIAL': {
      title: 'Nomor Serial Duplikat',
      message: `Nomor serial "${error.serialNumber}" sudah ada di sistem.`,
      solution: [
        'Cek apakah kaset sudah pernah di-import sebelumnya',
        'Hapus duplikat di file Excel/CSV',
        'Jika ingin update data, sistem akan otomatis update (tidak perlu khawatir)',
      ],
      icon: <AlertCircle className="h-5 w-5" />,
    },
    'INVALID_CASSETTE_TYPE': {
      title: 'Tipe Kaset Tidak Valid',
      message: `Tipe kaset "${error.typeCode}" tidak valid.`,
      solution: [
        'Pastikan CassetteTypeCode adalah: RB, AB, atau URJB',
        'Jika kosong, sistem akan auto-detect dari SerialNumber',
        'Hubungi admin jika masih error',
      ],
      icon: <Disc className="h-5 w-5" />,
    },
  };

  const errorInfo = errorMessages[error.code] || {
    title: 'Error',
    message: error.message,
    solution: ['Hubungi admin untuk bantuan'],
    icon: <AlertCircle className="h-5 w-5" />,
  };

  return (
    <Alert variant="destructive">
      <div className="flex items-start gap-3">
        {errorInfo.icon}
        <div className="flex-1">
          <AlertTitle>{errorInfo.title}</AlertTitle>
          <AlertDescription className="mt-2">
            <p>{errorInfo.message}</p>
            <div className="mt-3">
              <strong className="text-sm">Cara Memperbaiki:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                {errorInfo.solution.map((sol, idx) => (
                  <li key={idx}>{sol}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
```

---

### **8. HELP & GUIDANCE** ⭐ (PRIORITAS RENDAH)

**Solusi: Help Section dengan Video/Images**

```tsx
const HelpSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 Butuh Bantuan?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/docs/import-guide" target="_blank">
              <BookOpen className="h-4 w-4 mr-2" />
              Panduan Lengkap
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/docs/import-video" target="_blank">
              <Video className="h-4 w-4 mr-2" />
              Video Tutorial
            </a>
          </Button>
        </div>

        {/* Common Questions */}
        <Accordion type="single" collapsible>
          <AccordionItem value="format">
            <AccordionTrigger>Format file apa yang didukung?</AccordionTrigger>
            <AccordionContent>
              Kami mendukung Excel (.xlsx, .xls) dan CSV (.csv). Excel adalah
              yang paling mudah digunakan.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="required">
            <AccordionTrigger>Kolom apa saja yang wajib diisi?</AccordionTrigger>
            <AccordionContent>
              Untuk Banks: BankCode dan BankName. Untuk Cassettes:
              SerialNumber dan CustomerBankCode. Kolom lain optional.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Contact Support */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Masih bingung?</p>
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:support@hitachi.com">
              <Mail className="h-4 w-4 mr-2" />
              Hubungi Support
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 📋 **IMPLEMENTASI PRIORITAS**

### **Phase 1: Critical (1-2 minggu)**
1. ✅ Step-by-step wizard
2. ✅ Drag & drop upload area
3. ✅ Preview data sebelum import
4. ✅ Error messages yang jelas

### **Phase 2: High Priority (2-4 minggu)**
1. ✅ Validasi real-time
2. ✅ Template download dengan contoh
3. ✅ Progress indicator

### **Phase 3: Nice to Have (1-2 bulan)**
1. ✅ Help section dengan video
2. ✅ Streaming progress (WebSocket)
3. ✅ Import history

---

## 🎯 **KESIMPULAN**

Dengan implementasi fitur-fitur di atas, import data akan menjadi:
- ✅ **Mudah** - Step-by-step guidance
- ✅ **Jelas** - Preview dan validasi
- ✅ **Aman** - Error handling yang baik
- ✅ **Cepat** - Progress indicator
- ✅ **Terpercaya** - User tahu apa yang terjadi

**User non-tech akan bisa import data dengan mudah tanpa perlu bantuan IT!** 🎉

