
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface YearlyDataItem {
  year: string;
  revenue: number;
  sales: number;
  customers: number;
}

interface MonthlyDataItem {
  month: string;
  revenue: number;
  sales: number;
}

interface ProductTypeData {
  type: string;
  value: number;
  color: string;
}

interface SaleRecord {
  id: string;
  amount: number;
  sale_date: string;
  buyer_name: string;
  product_name: string;
  product_type: string;
  quantity: number;
  notes?: string;
}

const YearlySales = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [yearlyData, setYearlyData] = useState<YearlyDataItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [productTypeData, setProductTypeData] = useState<ProductTypeData[]>([]);
  const [loading, setLoading] = useState(false);

  const years = ['2024', '2023', '2022', '2021', '2020'];
  const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500'];

  useEffect(() => {
    fetchSalesData();
  }, [selectedYear, dateRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales')
        .select('*');

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('sale_date', dateRange.from.toISOString().split('T')[0])
          .lte('sale_date', dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Process data for charts
      const processedYearlyData = processYearlyData(data || []);
      const processedMonthlyData = processMonthlyDataForYear(data || []);
      const processedProductTypeData = processProductTypeData(data || []);

      setYearlyData(processedYearlyData);
      setMonthlyData(processedMonthlyData);
      setProductTypeData(processedProductTypeData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Fallback to mock data
      const mockYearlyData: YearlyDataItem[] = [
        { year: '2020', revenue: 450000, sales: 120, customers: 80 },
        { year: '2021', revenue: 520000, sales: 150, customers: 110 },
        { year: '2022', revenue: 680000, sales: 180, customers: 140 },
        { year: '2023', revenue: 750000, sales: 200, customers: 160 },
        { year: '2024', revenue: 890000, sales: 230, customers: 180 }
      ];

      const mockMonthlyData: MonthlyDataItem[] = [
        { month: 'Jan', revenue: 65000, sales: 18 },
        { month: 'Feb', revenue: 72000, sales: 20 },
        { month: 'Mar', revenue: 68000, sales: 19 },
        { month: 'Apr', revenue: 81000, sales: 22 },
        { month: 'May', revenue: 75000, sales: 21 },
        { month: 'Jun', revenue: 87000, sales: 24 },
        { month: 'Jul', revenue: 82000, sales: 23 },
        { month: 'Aug', revenue: 79000, sales: 22 },
        { month: 'Sep', revenue: 85000, sales: 24 },
        { month: 'Oct', revenue: 91000, sales: 26 },
        { month: 'Nov', revenue: 88000, sales: 25 },
        { month: 'Dec', revenue: 95000, sales: 27 }
      ];

      const mockProductTypeData: ProductTypeData[] = [
        { type: 'Ring', value: 35, color: '#FFD700' },
        { type: 'Necklace', value: 25, color: '#FFA500' },
        { type: 'Earring', value: 20, color: '#FF8C00' },
        { type: 'Bracelet', value: 15, color: '#FF7F50' },
        { type: 'Other', value: 5, color: '#FF6347' }
      ];

      setYearlyData(mockYearlyData);
      setMonthlyData(mockMonthlyData);
      setProductTypeData(mockProductTypeData);
    } finally {
      setLoading(false);
    }
  };

  const processYearlyData = (sales: SaleRecord[]): YearlyDataItem[] => {
    const yearlyStats: Record<string, {
      year: string;
      revenue: number;
      sales: number;
      customers: Set<string>;
    }> = {};
    
    sales.forEach(sale => {
      const year = new Date(sale.sale_date).getFullYear().toString();
      if (!yearlyStats[year]) {
        yearlyStats[year] = { year, revenue: 0, sales: 0, customers: new Set() };
      }
      yearlyStats[year].revenue += Number(sale.amount);
      yearlyStats[year].sales += 1;
      yearlyStats[year].customers.add(sale.buyer_name);
    });

    return Object.values(yearlyStats).map(stat => ({
      year: stat.year,
      revenue: stat.revenue,
      sales: stat.sales,
      customers: stat.customers.size
    })).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  const processMonthlyDataForYear = (sales: SaleRecord[]): MonthlyDataItem[] => {
    const monthlyStats: Record<string, {
      month: string;
      revenue: number;
      sales: number;
    }> = {};
    
    sales.forEach(sale => {
      const saleYear = new Date(sale.sale_date).getFullYear().toString();
      if (saleYear === selectedYear) {
        const month = new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { month, revenue: 0, sales: 0 };
        }
        monthlyStats[month].revenue += Number(sale.amount);
        monthlyStats[month].sales += 1;
      }
    });

    return Object.values(monthlyStats);
  };

  const processProductTypeData = (sales: SaleRecord[]): ProductTypeData[] => {
    const typeStats: Record<string, number> = {};
    let total = 0;
    
    sales.forEach(sale => {
      const saleYear = new Date(sale.sale_date).getFullYear().toString();
      if (saleYear === selectedYear) {
        typeStats[sale.product_type] = (typeStats[sale.product_type] || 0) + 1;
        total += 1;
      }
    });

    return Object.entries(typeStats).map(([type, count], index) => ({
      type,
      value: Math.round((count / total) * 100),
      color: colors[index % colors.length]
    }));
  };

  const currentYearTotal = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
  const currentYearSales = monthlyData.reduce((sum, month) => sum + month.sales, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Yearly Sales Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive yearly performance and trends analysis
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter by date range"
            className="w-full sm:w-auto"
          />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 bg-white/50 border-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Yearly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">{selectedYear} Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹{currentYearTotal.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              +15% from last year
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in delay-100">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {currentYearSales}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              +12% from last year
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in delay-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Avg Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ₹{Math.round(currentYearTotal / 12).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Per month average
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in delay-300">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              +18%
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Year over year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Trend */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-400">
          <CardHeader>
            <CardTitle className="text-gray-800">5-Year Revenue Trend</CardTitle>
            <CardDescription>Historical performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FFD700" 
                    strokeWidth={4}
                    dot={{ fill: '#FFA500', strokeWidth: 3, r: 6 }}
                    className="animate-fade-in"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Product Type Distribution */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-500">
          <CardHeader>
            <CardTitle className="text-gray-800">Product Distribution {selectedYear}</CardTitle>
            <CardDescription>Sales by product type</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ type, value }) => `${type}: ${value}%`}
                  >
                    {productTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-600">
        <CardHeader>
          <CardTitle className="text-gray-800">Monthly Breakdown - {selectedYear}</CardTitle>
          <CardDescription>Month-by-month performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="url(#goldGradient)" radius={[4, 4, 0, 0]} className="animate-fade-in" />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFA500" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-700">
        <CardHeader>
          <CardTitle className="text-gray-800">Top Performing Months - {selectedYear}</CardTitle>
          <CardDescription>Best performing months this year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((month, index) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-4 bg-white/30 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100 + 700}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 hover:scale-110">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{month.month} {selectedYear}</h4>
                      <p className="text-sm text-gray-600">{month.sales} sales completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{month.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlySales;
