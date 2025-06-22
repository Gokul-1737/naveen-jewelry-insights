import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const ExportData = () => {
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [salesData, setSalesData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [leaveAmountsData, setLeaveAmountsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSalesData(),
        fetchPurchasesData(),
        fetchStockData(),
        fetchLeaveAmountsData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (dateRange.from && dateRange.to) {
        query = query
          .gte('sale_date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('sale_date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;
      setSalesData(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchPurchasesData = async () => {
    try {
      let query = supabase
        .from('purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (dateRange.from && dateRange.to) {
        query = query
          .gte('purchase_date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('purchase_date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;
      setPurchasesData(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchStockData = async () => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockData(data || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  const fetchLeaveAmountsData = async () => {
    try {
      let query = supabase
        .from('leave_amounts')
        .select('*')
        .order('leave_date', { ascending: false });

      if (dateRange.from && dateRange.to) {
        query = query
          .gte('leave_date', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('leave_date', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) throw error;
      setLeaveAmountsData(data || []);
    } catch (error) {
      console.error('Error fetching leave amounts:', error);
    }
  };

  const exportSalesData = () => {
    if (salesData.length === 0) {
      toast.error('No sales data to export');
      return;
    }

    const exportData = salesData.map(sale => ({
      'Date': format(new Date(sale.sale_date), 'yyyy-MM-dd'),
      'Product Name': sale.product_name,
      'Product Type': sale.product_type,
      'Weight (g)': sale.product_weight_grams || 0,
      'Quantity': sale.quantity,
      'Buyer Name': sale.buyer_name,
      'Total Amount': sale.amount,
      'Given Amount': sale.given_amount || 0,
      'Balance Amount': sale.balance_amount || 0,
      'Notes': sale.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');

    const fileName = `sales_data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Sales data exported successfully');
  };

  const exportTodaysData = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Filter today's sales
    const todaysSales = salesData.filter(sale => 
      format(new Date(sale.sale_date), 'yyyy-MM-dd') === today
    );
    
    // Filter today's leave amounts
    const todaysLeaveAmounts = leaveAmountsData.filter(leave => 
      format(new Date(leave.leave_date), 'yyyy-MM-dd') === today
    );

    if (todaysSales.length === 0 && todaysLeaveAmounts.length === 0) {
      toast.error('No data found for today');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Add today's sales
    if (todaysSales.length > 0) {
      const salesExportData = todaysSales.map(sale => ({
        'Date': format(new Date(sale.sale_date), 'yyyy-MM-dd'),
        'Product Name': sale.product_name,
        'Product Type': sale.product_type,
        'Weight (g)': sale.product_weight_grams || 0,
        'Quantity': sale.quantity,
        'Buyer Name': sale.buyer_name,
        'Total Amount': sale.amount,
        'Given Amount': sale.given_amount || 0,
        'Balance Amount': sale.balance_amount || 0,
        'Notes': sale.notes || ''
      }));
      const salesWorksheet = XLSX.utils.json_to_sheet(salesExportData);
      XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Today Sales');
    }

    // Add today's leave amounts
    if (todaysLeaveAmounts.length > 0) {
      const leaveAmountsExportData = todaysLeaveAmounts.map(leave => ({
        'Date': format(new Date(leave.leave_date), 'yyyy-MM-dd'),
        'Product Name': leave.product_name,
        'Product Type': leave.product_type,
        'Weight (g)': leave.product_weight_grams || 0,
        'Quantity': leave.quantity,
        'Buyer Name': leave.buyer_name,
        'Amount': leave.amount,
        'Notes': leave.notes || ''
      }));
      const leaveAmountsWorksheet = XLSX.utils.json_to_sheet(leaveAmountsExportData);
      XLSX.utils.book_append_sheet(workbook, leaveAmountsWorksheet, 'Today Leave Amounts');
    }

    const fileName = `todays_data_${today}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Today\'s data exported successfully');
  };

  const exportPurchasesData = () => {
    if (purchasesData.length === 0) {
      toast.error('No purchases data to export');
      return;
    }

    const exportData = purchasesData.map(purchase => ({
      'Date': format(new Date(purchase.purchase_date), 'yyyy-MM-dd'),
      'Product Name': purchase.product_name,
      'Product Type': purchase.product_type,
      'Weight (g)': purchase.product_weight_grams,
      'Quantity': purchase.quantity,
      'Buyer Name': purchase.buyer_name,
      'Amount': purchase.amount,
      'Notes': purchase.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases Data');

    const fileName = `purchases_data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Purchases data exported successfully');
  };

  const exportStockData = () => {
    if (stockData.length === 0) {
      toast.error('No stock data to export');
      return;
    }

    const exportData = stockData.map(stock => ({
      'Product Name': stock.product_name,
      'Product Type': stock.product_type,
      'Weight (g)': stock.product_weight_grams,
      'Available Quantity': stock.quantity_available,
      'Created Date': format(new Date(stock.created_at), 'yyyy-MM-dd'),
      'Last Updated': format(new Date(stock.updated_at), 'yyyy-MM-dd')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Data');

    const fileName = `stock_data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Stock data exported successfully');
  };

  const exportLeaveAmountsData = () => {
    if (leaveAmountsData.length === 0) {
      toast.error('No leave amounts data to export');
      return;
    }

    const exportData = leaveAmountsData.map(leave => ({
      'Date': format(new Date(leave.leave_date), 'yyyy-MM-dd'),
      'Product Name': leave.product_name,
      'Product Type': leave.product_type,
      'Weight (g)': leave.product_weight_grams || 0,
      'Quantity': leave.quantity,
      'Buyer Name': leave.buyer_name,
      'Amount': leave.amount,
      'Notes': leave.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Amounts Data');

    const fileName = `leave_amounts_data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Leave amounts data exported successfully');
  };

  const exportAllData = () => {
    const workbook = XLSX.utils.book_new();

    // Sales data
    if (salesData.length > 0) {
      const salesExportData = salesData.map(sale => ({
        'Date': format(new Date(sale.sale_date), 'yyyy-MM-dd'),
        'Product Name': sale.product_name,
        'Product Type': sale.product_type,
        'Weight (g)': sale.product_weight_grams || 0,
        'Quantity': sale.quantity,
        'Buyer Name': sale.buyer_name,
        'Total Amount': sale.amount,
        'Given Amount': sale.given_amount || 0,
        'Balance Amount': sale.balance_amount || 0,
        'Notes': sale.notes || ''
      }));
      const salesWorksheet = XLSX.utils.json_to_sheet(salesExportData);
      XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Sales');
    }

    // Purchases data
    if (purchasesData.length > 0) {
      const purchasesExportData = purchasesData.map(purchase => ({
        'Date': format(new Date(purchase.purchase_date), 'yyyy-MM-dd'),
        'Product Name': purchase.product_name,
        'Product Type': purchase.product_type,
        'Weight (g)': purchase.product_weight_grams,
        'Quantity': purchase.quantity,
        'Buyer Name': purchase.buyer_name,
        'Amount': purchase.amount,
        'Notes': purchase.notes || ''
      }));
      const purchasesWorksheet = XLSX.utils.json_to_sheet(purchasesExportData);
      XLSX.utils.book_append_sheet(workbook, purchasesWorksheet, 'Purchases');
    }

    // Stock data
    if (stockData.length > 0) {
      const stockExportData = stockData.map(stock => ({
        'Product Name': stock.product_name,
        'Product Type': stock.product_type,
        'Weight (g)': stock.product_weight_grams,
        'Available Quantity': stock.quantity_available,
        'Created Date': format(new Date(stock.created_at), 'yyyy-MM-dd'),
        'Last Updated': format(new Date(stock.updated_at), 'yyyy-MM-dd')
      }));
      const stockWorksheet = XLSX.utils.json_to_sheet(stockExportData);
      XLSX.utils.book_append_sheet(workbook, stockWorksheet, 'Stock');
    }

    // Leave amounts data
    if (leaveAmountsData.length > 0) {
      const leaveAmountsExportData = leaveAmountsData.map(leave => ({
        'Date': format(new Date(leave.leave_date), 'yyyy-MM-dd'),
        'Product Name': leave.product_name,
        'Product Type': leave.product_type,
        'Weight (g)': leave.product_weight_grams || 0,
        'Quantity': leave.quantity,
        'Buyer Name': leave.buyer_name,
        'Amount': leave.amount,
        'Notes': leave.notes || ''
      }));
      const leaveAmountsWorksheet = XLSX.utils.json_to_sheet(leaveAmountsExportData);
      XLSX.utils.book_append_sheet(workbook, leaveAmountsWorksheet, 'Leave Amounts');
    }

    const fileName = `complete_data_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('All data exported successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export Data</h1>
        <p className="text-gray-600">Export your sales, purchases, stock data, and leave amounts to Excel format</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
          <CardDescription>Select a date range to filter sales and purchases data (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setDateRange({ from: null, to: null })}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Data Export */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Today's Complete Data
            </CardTitle>
            <CardDescription>
              Export today's sales and leave amounts in one file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportTodaysData} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Today's Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sales Data
            </CardTitle>
            <CardDescription>
              {salesData.length} records
              {dateRange.from && dateRange.to && (
                <span className="block text-xs">
                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportSalesData} 
              disabled={loading || salesData.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Sales
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Leave Amounts
            </CardTitle>
            <CardDescription>
              {leaveAmountsData.length} records
              {dateRange.from && dateRange.to && (
                <span className="block text-xs">
                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportLeaveAmountsData} 
              disabled={loading || leaveAmountsData.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Leave Amounts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Purchases Data
            </CardTitle>
            <CardDescription>
              {purchasesData.length} records
              {dateRange.from && dateRange.to && (
                <span className="block text-xs">
                  {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportPurchasesData} 
              disabled={loading || purchasesData.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Purchases
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stock Data
            </CardTitle>
            <CardDescription>
              {stockData.length} items in stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportStockData} 
              disabled={loading || stockData.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Stock
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Complete Export
            </CardTitle>
            <CardDescription>
              Export all data in one file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportAllData} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportData;
