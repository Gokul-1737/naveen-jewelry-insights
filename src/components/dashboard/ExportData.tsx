
import { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const ExportData = () => {
  const [exportType, setExportType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('csv');

  const handleExport = () => {
    // Mock export functionality - replace with actual implementation
    toast({
      title: "Export Started",
      description: `Exporting ${exportType} data in ${format.toUpperCase()} format...`,
    });

    // Simulate download
    setTimeout(() => {
      const filename = `naveen-jewelry-${exportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      
      // Create mock data
      const mockData = [
        ['Date', 'Product Name', 'Product Type', 'Amount', 'Buyer Name', 'Quantity', 'Notes'],
        ['2024-01-15', 'Diamond Ring', 'Ring', '25000', 'Priya Sharma', '1', 'Engagement ring'],
        ['2024-01-15', 'Gold Necklace', 'Necklace', '35000', 'Rajesh Kumar', '1', 'Wedding jewelry'],
        ['2024-01-14', 'Pearl Earrings', 'Earrings', '8000', 'Anita Singh', '1', ''],
      ];

      if (format === 'csv') {
        const csvContent = mockData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: `Data exported successfully as ${filename}`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Export Sales Data
        </h1>
        <p className="text-gray-600 mt-2">
          Download your sales data in various formats for analysis
        </p>
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
                  <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-1" size={16} />
              Date Range
            </label>
            <div className="space-y-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-white/50 border-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white/50 border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white/50 border-white/30"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4">
            <Button
              onClick={handleExport}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
            >
              <Download className="mr-2" size={18} />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Sales Report',
            description: 'Complete sales data with buyer information',
            type: 'sales',
            icon: '📊',
            size: '~2.5MB'
          },
          {
            title: 'Product Summary',
            description: 'Product-wise sales and revenue analysis',
            type: 'products',
            icon: '💎',
            size: '~1.2MB'
          },
          {
            title: 'Customer Data',
            description: 'Customer purchase history and preferences',
            type: 'customers',
            icon: '👥',
            size: '~800KB'
          },
          {
            title: 'Financial Summary',
            description: 'Monthly and yearly financial overview',
            type: 'financial',
            icon: '💰',
            size: '~500KB'
          },
          {
            title: 'Inventory Report',
            description: 'Stock levels and product availability',
            type: 'inventory',
            icon: '📦',
            size: '~1.1MB'
          },
          {
            title: 'Analytics Data',
            description: 'Detailed analytics and performance metrics',
            type: 'analytics',
            icon: '📈',
            size: '~1.8MB'
          }
        ].map((option, index) => (
          <Card key={index} className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-2xl">{option.icon}</div>
                <span className="text-xs text-gray-500">{option.size}</span>
              </div>
              <CardTitle className="text-lg text-gray-800">{option.title}</CardTitle>
              <CardDescription className="text-sm">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  setExportType(option.type);
                  handleExport();
                }}
                variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Download size={16} className="mr-2" />
                Quick Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export History */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Recent Exports</CardTitle>
          <CardDescription>Your export history and download links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'sales-report-2024-01-15.csv', date: '2024-01-15', size: '2.3MB', status: 'Ready' },
              { name: 'monthly-summary-2024-01.xlsx', date: '2024-01-01', size: '1.8MB', status: 'Ready' },
              { name: 'yearly-analysis-2023.pdf', date: '2023-12-31', size: '4.2MB', status: 'Ready' },
            ].map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/30 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3">
                  <FileText size={20} className="text-amber-600" />
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-600">{file.date} • {file.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {file.status}
                  </span>
                  <Button size="sm" variant="outline">
                    <Download size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportData;
