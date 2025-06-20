
import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';

interface SaleRecord {
  id: string;
  product_name: string;
  product_type: string;
  product_weight_grams: number;
  amount: number;
  given_amount: number;
  balance_amount: number;
  buyer_name: string;
  quantity: number;
  notes: string;
  sale_date: string;
  created_at: string;
}

const ExportData = () => {
  const [exportType, setExportType] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SaleRecord[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, exportType]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date range filter
      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('sale_date', dateRange.from.toISOString().split('T')[0])
          .lte('sale_date', dateRange.to.toISOString().split('T')[0]);
      } else {
        // Apply default filters based on export type
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        switch (exportType) {
          case 'today':
            query = query.eq('sale_date', today.toISOString().split('T')[0]);
            break;
          case 'monthly':
            const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
            const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
            query = query.gte('sale_date', monthStart).lte('sale_date', monthEnd);
            break;
          case 'yearly':
            const yearStart = `${currentYear}-01-01`;
            const yearEnd = `${currentYear}-12-31`;
            query = query.gte('sale_date', yearStart).lte('sale_date', yearEnd);
            break;
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setSalesData(data || []);
      setFilteredCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (salesData.length === 0) {
      toast({
        title: "No Data",
        description: "No sales data found for the selected criteria",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const filename = `naveen-jewelry-${exportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      
      // Prepare export data with all fields
      const exportData = salesData.map(sale => ({
        'Date': new Date(sale.sale_date).toLocaleDateString(),
        'Product Name': sale.product_name,
        'Product Type': sale.product_type,
        'Weight (grams)': sale.product_weight_grams,
        'Total Amount': sale.amount,
        'Given Amount': sale.given_amount,
        'Balance Amount': sale.balance_amount,
        'Buyer Name': sale.buyer_name,
        'Quantity': sale.quantity,
        'Notes': sale.notes || '',
        'Created At': new Date(sale.created_at).toLocaleString()
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => `"${row[header]}"`).join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
        XLSX.writeFile(wb, filename);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Successfully exported ${salesData.length} records as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickExport = async (type: string) => {
    setExportType(type);
    // Wait for state update and data fetch
    setTimeout(() => {
      handleExport();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Export Sales Data
          </h1>
          <p className="text-gray-600 mt-2">
            Download your sales data in various formats for analysis
            {filteredCount > 0 && (
              <span className="ml-2 font-semibold text-green-600">
                ({filteredCount} records found)
              </span>
            )}
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          placeholder="Filter by date range"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Export Configuration */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <FileText className="mr-2" size={20} />
            Export Configuration
          </CardTitle>
          <CardDescription>
            Configure your export settings and download options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="bg-white/50 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales Data</SelectItem>
                  <SelectItem value="today">Today's Sales</SelectItem>
                  <SelectItem value="monthly">Monthly Sales</SelectItem>
                  <SelectItem value="yearly">Yearly Sales</SelectItem>
                  <SelectItem value="products">Product Summary</SelectItem>
                  <SelectItem value="customers">Customer Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="bg-white/50 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4">
            <Button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
              disabled={loading || salesData.length === 0}
            >
              <Download className="mr-2" size={18} />
              {loading ? 'Preparing Export...' : `Export ${filteredCount} Records`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Today\'s Sales',
            description: 'Export all sales from today',
            type: 'today',
            icon: '📅',
            count: salesData.filter(s => s.sale_date === new Date().toISOString().split('T')[0]).length
          },
          {
            title: 'Monthly Sales',
            description: 'Current month sales report',
            type: 'monthly',
            icon: '📊',
            count: salesData.length
          },
          {
            title: 'Yearly Sales',
            description: 'Complete yearly sales data',
            type: 'yearly',
            icon: '📈',
            count: salesData.length
          },
          {
            title: 'All Sales',
            description: 'Complete sales database',
            type: 'all',
            icon: '💎',
            count: salesData.length
          },
          {
            title: 'High Value Sales',
            description: 'Sales above ₹50,000',
            type: 'high-value',
            icon: '💰',
            count: salesData.filter(s => s.amount > 50000).length
          },
          {
            title: 'Pending Payments',
            description: 'Sales with balance amount',
            type: 'pending',
            icon: '⏳',
            count: salesData.filter(s => s.balance_amount > 0).length
          }
        ].map((option, index) => (
          <Card key={index} className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-2xl">{option.icon}</div>
                <span className="text-sm font-bold text-amber-600">{option.count} records</span>
              </div>
              <CardTitle className="text-lg text-gray-800">{option.title}</CardTitle>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => quickExport(option.type)}
                variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                disabled={loading || option.count === 0}
              >
                <Download size={16} className="mr-2" />
                Quick Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Preview */}
      {salesData.length > 0 && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Data Preview</CardTitle>
            <CardDescription>Preview of sales data to be exported</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Weight (g)</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Given</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Buyer</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.slice(0, 5).map((sale, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-2">{new Date(sale.sale_date).toLocaleDateString()}</td>
                      <td className="p-2">{sale.product_name}</td>
                      <td className="p-2">{sale.product_type}</td>
                      <td className="p-2">{sale.product_weight_grams}g</td>
                      <td className="p-2">₹{sale.amount.toLocaleString()}</td>
                      <td className="p-2">₹{sale.given_amount.toLocaleString()}</td>
                      <td className="p-2">₹{sale.balance_amount.toLocaleString()}</td>
                      <td className="p-2">{sale.buyer_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesData.length > 5 && (
                <p className="text-center text-gray-500 mt-4">
                  ... and {salesData.length - 5} more records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExportData;
