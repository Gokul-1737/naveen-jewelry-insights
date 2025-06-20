
import { useState } from 'react';
import { Upload, FileText, Download, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface ImportData {
  product_type: string;
  product_weight_grams: number;
  quantity: number;
  buyer_name: string;
  product_name: string;
  amount: number;
  given_amount: number;
  notes?: string;
}

const ImportData = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [previewData, setPreviewData] = useState<ImportData[]>([]);

  const productTypes = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Chain', 'Bangle', 'Anklet'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      parseFile(uploadedFile);
    }
  };

  const parseFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      let parsedData: ImportData[] = [];

      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const dataItem: any = {};
            headers.forEach((header, index) => {
              dataItem[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
            });
            
            parsedData.push({
              product_type: dataItem.product_type || '',
              product_weight_grams: parseFloat(dataItem.product_weight_grams) || 0,
              quantity: parseInt(dataItem.quantity) || 1,
              buyer_name: dataItem.buyer_name || '',
              product_name: dataItem.product_name || '',
              amount: parseFloat(dataItem.amount) || 0,
              given_amount: parseFloat(dataItem.given_amount) || 0,
              notes: dataItem.notes || ''
            });
          }
        }
      } else if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      }

      setImportData(parsedData);
      setPreviewData(parsedData.slice(0, 5)); // Show first 5 rows for preview
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsedData.length} records to import`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast({
        title: "Error",
        description: "No data to import",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const salesData = importData.map(item => ({
        product_name: item.product_name,
        product_type: item.product_type,
        product_weight_grams: item.product_weight_grams,
        amount: item.amount,
        given_amount: item.given_amount,
        buyer_name: item.buyer_name,
        quantity: item.quantity,
        notes: item.notes,
        sale_date: new Date().toISOString().split('T')[0]
      }));

      const { error } = await supabase
        .from('sales')
        .insert(salesData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${importData.length} records`,
      });

      // Reset form
      setFile(null);
      setImportData([]);
      setPreviewData([]);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['product_name', 'product_type', 'product_weight_grams', 'amount', 'given_amount', 'buyer_name', 'quantity', 'notes'];
    const sampleData = [
      ['Diamond Ring', 'Ring', '5.5', '25000', '15000', 'John Doe', '1', 'Engagement ring'],
      ['Gold Necklace', 'Necklace', '12.3', '35000', '20000', 'Jane Smith', '1', 'Wedding jewelry']
    ];

    let content = '';
    if (importFormat === 'csv') {
      content = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    } else {
      const jsonData = sampleData.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      content = JSON.stringify(jsonData, null, 2);
    }

    const blob = new Blob([content], { type: importFormat === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_template.${importFormat}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Import Sales Data
          </h1>
          <p className="text-gray-600 mt-2">
            Import sales data from CSV or JSON files
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter imported data"
            className="w-full sm:w-auto"
          />
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <Download size={16} className="mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Import Configuration */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <Upload className="mr-2" size={20} />
            Import Configuration
          </CardTitle>
          <CardDescription>
            Upload and configure your sales data import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Format
              </label>
              <Select value={importFormat} onValueChange={setImportFormat}>
                <SelectTrigger className="bg-white/50 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <Input
                id="file-upload"
                type="file"
                accept={importFormat === 'csv' ? '.csv' : '.json'}
                onChange={handleFileUpload}
                className="bg-white/50 border-white/30"
                disabled={loading}
              />
            </div>
          </div>

          {/* Expected Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-blue-600 mt-0.5" size={16} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Expected columns:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>product_name: Name of the jewelry item</li>
                  <li>product_type: Type (Ring, Necklace, etc.)</li>
                  <li>product_weight_grams: Weight in grams</li>
                  <li>amount: Total sale amount</li>
                  <li>given_amount: Amount paid by customer</li>
                  <li>buyer_name: Customer name</li>
                  <li>quantity: Number of items (default: 1)</li>
                  <li>notes: Additional notes (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      {previewData.length > 0 && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Data Preview</CardTitle>
            <CardDescription>
              Preview of first 5 records from your file ({importData.length} total records)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-2">Product Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Weight (g)</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Given</th>
                    <th className="text-left p-2">Buyer</th>
                    <th className="text-left p-2">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-2">{item.product_name}</td>
                      <td className="p-2">{item.product_type}</td>
                      <td className="p-2">{item.product_weight_grams}g</td>
                      <td className="p-2">₹{item.amount}</td>
                      <td className="p-2">₹{item.given_amount}</td>
                      <td className="p-2">{item.buyer_name}</td>
                      <td className="p-2">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleImport}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                disabled={loading || importData.length === 0}
              >
                <Upload size={16} className="mr-2" />
                Import {importData.length} Records
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setImportData([]);
                  setPreviewData([]);
                }}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportData;
