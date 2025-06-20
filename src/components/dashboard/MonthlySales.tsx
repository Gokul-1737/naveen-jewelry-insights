
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface MonthlyDataItem {
  month: string;
  revenue: number;
  given: number;
  balance: number;
  sales: number;
  customers: number;
}

interface DailyDataItem {
  day: number;
  revenue: number;
  given: number;
  balance: number;
  sales: number;
}

interface SaleRecord {
  id: string;
  amount: number;
  given_amount: number;
  balance_amount: number;
  sale_date: string;
  buyer_name: string;
  product_name: string;
  product_type: string;
  product_weight_grams: number;
  quantity: number;
  notes?: string;
}

const MonthlySales = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [dailyData, setDailyData] = useState<DailyDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2024', '2023', '2022'];

  useEffect(() => {
    fetchSalesData();
  }, [selectedMonth, selectedYear, dateRange]);

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
      const processedMonthlyData = processMonthlyData(data || []);
      const processedDailyData = processDailyData(data || []);

      setMonthlyData(processedMonthlyData);
      setDailyData(processedDailyData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Fallback to mock data
      const mockMonthlyData: MonthlyDataItem[] = [
        { month: 'Jan', revenue: 45000, given: 30000, balance: 15000, sales: 12, customers: 8 },
        { month: 'Feb', revenue: 52000, given: 40000, balance: 12000, sales: 15, customers: 11 },
        { month: 'Mar', revenue: 48000, given: 38000, balance: 10000, sales: 13, customers: 9 },
        { month: 'Apr', revenue: 61000, given: 50000, balance: 11000, sales: 18, customers: 14 },
        { month: 'May', revenue: 55000, given: 45000, balance: 10000, sales: 16, customers: 12 },
        { month: 'Jun', revenue: 67000, given: 55000, balance: 12000, sales: 20, customers: 16 }
      ];

      const mockDailyData: DailyDataItem[] = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        given: Math.floor(Math.random() * 4000) + 800,
        balance: Math.floor(Math.random() * 1000) + 200,
        sales: Math.floor(Math.random() * 3) + 1
      }));

      setMonthlyData(mockMonthlyData);
      setDailyData(mockDailyData);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (sales: SaleRecord[]): MonthlyDataItem[] => {
    const monthlyStats: Record<string, {
      month: string;
      revenue: number;
      given: number;
      balance: number;
      sales: number;
      customers: Set<string>;
    }> = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { month, revenue: 0, given: 0, balance: 0, sales: 0, customers: new Set() };
      }
      monthlyStats[month].revenue += Number(sale.amount);
      monthlyStats[month].given += Number(sale.given_amount);
      monthlyStats[month].balance += Number(sale.balance_amount);
      monthlyStats[month].sales += 1;
      monthlyStats[month].customers.add(sale.buyer_name);
    });

    return Object.values(monthlyStats).map(stat => ({
      month: stat.month,
      revenue: stat.revenue,
      given: stat.given,
      balance: stat.balance,
      sales: stat.sales,
      customers: stat.customers.size
    }));
  };

  const processDailyData = (sales: SaleRecord[]): DailyDataItem[] => {
    const dailyStats: Record<number, {
      day: number;
      revenue: number;
      given: number;
      balance: number;
      sales: number;
    }> = {};
    
    sales.forEach(sale => {
      const day = new Date(sale.sale_date).getDate();
      if (!dailyStats[day]) {
        dailyStats[day] = { day, revenue: 0, given: 0, balance: 0, sales: 0 };
      }
      dailyStats[day].revenue += Number(sale.amount);
      dailyStats[day].given += Number(sale.given_amount);
      dailyStats[day].balance += Number(sale.balance_amount);
      dailyStats[day].sales += 1;
    });

    return Object.values(dailyStats).sort((a, b) => a.day - b.day);
  };

  const currentMonthTotal = dailyData.reduce((sum, day) => sum + day.revenue, 0);
  const currentMonthGiven = dailyData.reduce((sum, day) => sum + day.given, 0);
  const currentMonthBalance = dailyData.reduce((sum, day) => sum + day.balance, 0);
  const currentMonthSales = dailyData.reduce((sum, day) => sum + day.sales, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Monthly Sales
          </h1>
          <p className="text-gray-600 mt-2">
            Detailed monthly sales analysis and trends
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter by date range"
            className="w-full sm:w-auto"
          />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32 bg-white/50 border-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24 bg-white/50 border-white/30">
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

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              {months[parseInt(selectedMonth)]} Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹{currentMonthTotal.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Amount Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ₹{currentMonthGiven.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round((currentMonthGiven / currentMonthTotal) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Balance Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ₹{currentMonthBalance.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Math.round((currentMonthBalance / currentMonthTotal) * 100)}% pending
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {currentMonthSales}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-gray-800">
              Daily Sales - {months[parseInt(selectedMonth)]} {selectedYear}
            </CardTitle>
            <CardDescription>Revenue and payment breakdown by day</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const labels = {
                        revenue: 'Total Revenue',
                        given: 'Amount Given',
                        balance: 'Balance Amount'
                      };
                      return [`₹${value.toLocaleString()}`, labels[name] || name];
                    }}
                    labelFormatter={(day) => `Day ${day}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22C55E" 
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                    name="revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="given" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                    name="given"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                    name="balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-gray-800">Monthly Comparison</CardTitle>
            <CardDescription>Year-to-date performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      const labels = {
                        revenue: 'Total Revenue',
                        given: 'Amount Given', 
                        balance: 'Balance Amount'
                      };
                      return [`₹${value.toLocaleString()}`, labels[name] || name];
                    }}
                  />
                  <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} name="revenue" />
                  <Bar dataKey="given" fill="#3B82F6" radius={[4, 4, 0, 0]} name="given" />
                  <Bar dataKey="balance" fill="#EF4444" radius={[4, 4, 0, 0]} name="balance" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products This Month */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gray-800">
            Top Products - {months[parseInt(selectedMonth)]}
          </CardTitle>
          <CardDescription>Best selling items this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { product: 'Diamond Ring Collection', sales: 12, revenue: 180000, weight: 65.5, balance: 30000 },
              { product: 'Gold Necklace Set', sales: 8, revenue: 120000, weight: 89.2, balance: 20000 },
              { product: 'Pearl Earrings', sales: 15, revenue: 90000, weight: 45.8, balance: 15000 },
              { product: 'Silver Bracelet', sales: 6, revenue: 45000, weight: 28.3, balance: 5000 },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/30 rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 hover:scale-110">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.product}</h4>
                    <p className="text-sm text-gray-600">{item.sales} units • {item.weight}g total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{item.revenue.toLocaleString()}</p>
                  {item.balance > 0 && (
                    <p className="text-sm text-red-600">₹{item.balance.toLocaleString()} pending</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlySales;
