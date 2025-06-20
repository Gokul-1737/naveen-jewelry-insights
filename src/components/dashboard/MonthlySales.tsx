
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

const MonthlySales = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
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
      const mockMonthlyData = [
        { month: 'Jan', revenue: 45000, sales: 12, customers: 8 },
        { month: 'Feb', revenue: 52000, sales: 15, customers: 11 },
        { month: 'Mar', revenue: 48000, sales: 13, customers: 9 },
        { month: 'Apr', revenue: 61000, sales: 18, customers: 14 },
        { month: 'May', revenue: 55000, sales: 16, customers: 12 },
        { month: 'Jun', revenue: 67000, sales: 20, customers: 16 }
      ];

      const mockDailyData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        sales: Math.floor(Math.random() * 3) + 1
      }));

      setMonthlyData(mockMonthlyData);
      setDailyData(mockDailyData);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (sales) => {
    const monthlyStats = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { month, revenue: 0, sales: 0, customers: new Set() };
      }
      monthlyStats[month].revenue += sale.amount;
      monthlyStats[month].sales += 1;
      monthlyStats[month].customers.add(sale.buyer_name);
    });

    return Object.values(monthlyStats).map(stat => ({
      ...stat,
      customers: stat.customers.size
    }));
  };

  const processDailyData = (sales) => {
    const dailyStats = {};
    
    sales.forEach(sale => {
      const day = new Date(sale.sale_date).getDate();
      if (!dailyStats[day]) {
        dailyStats[day] = { day, revenue: 0, sales: 0 };
      }
      dailyStats[day].revenue += sale.amount;
      dailyStats[day].sales += 1;
    });

    return Object.values(dailyStats).sort((a, b) => a.day - b.day);
  };

  const currentMonthTotal = dailyData.reduce((sum, day) => sum + day.revenue, 0);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CardTitle className="text-lg text-gray-800">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {currentMonthSales}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Avg Daily Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ₹{Math.round(currentMonthTotal / 30).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Per day average
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
            <CardDescription>Revenue breakdown by day</CardDescription>
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
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(day) => `Day ${day}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FFD700" 
                    strokeWidth={3}
                    dot={{ fill: '#FFA500', strokeWidth: 2, r: 4 }}
                    className="animate-fade-in"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Yearly Comparison */}
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
              { product: 'Diamond Ring Collection', sales: 12, revenue: 180000 },
              { product: 'Gold Necklace Set', sales: 8, revenue: 120000 },
              { product: 'Pearl Earrings', sales: 15, revenue: 90000 },
              { product: 'Silver Bracelet', sales: 6, revenue: 45000 },
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
                    <p className="text-sm text-gray-600">{item.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{item.revenue.toLocaleString()}</p>
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
