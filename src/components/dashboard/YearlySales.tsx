
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown } from 'lucide-react';

const YearlySales = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [yearlyData, setYearlyData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const years = ['2024', '2023', '2022', '2021'];

  // Mock data - replace with Supabase data
  useEffect(() => {
    const mockYearlyData = [
      { month: 'Jan', revenue: 450000, sales: 120, customers: 80 },
      { month: 'Feb', revenue: 520000, sales: 150, customers: 110 },
      { month: 'Mar', revenue: 480000, sales: 130, customers: 90 },
      { month: 'Apr', revenue: 610000, sales: 180, customers: 140 },
      { month: 'May', revenue: 550000, sales: 160, customers: 120 },
      { month: 'Jun', revenue: 670000, sales: 200, customers: 160 },
      { month: 'Jul', revenue: 720000, sales: 210, customers: 170 },
      { month: 'Aug', revenue: 680000, sales: 190, customers: 150 },
      { month: 'Sep', revenue: 590000, sales: 170, customers: 130 },
      { month: 'Oct', revenue: 630000, sales: 180, customers: 140 },
      { month: 'Nov', revenue: 750000, sales: 220, customers: 180 },
      { month: 'Dec', revenue: 820000, sales: 250, customers: 200 }
    ];

    const mockGrowthData = [
      { year: '2021', revenue: 5200000 },
      { year: '2022', revenue: 6800000 },
      { year: '2023', revenue: 7500000 },
      { year: '2024', revenue: 8200000 }
    ];

    const mockCategoryData = [
      { name: 'Rings', value: 35, revenue: 2870000, color: '#FFD700' },
      { name: 'Necklaces', value: 25, revenue: 2050000, color: '#FFA500' },
      { name: 'Earrings', value: 20, revenue: 1640000, color: '#FF8C00' },
      { name: 'Bracelets', value: 15, revenue: 1230000, color: '#DAA520' },
      { name: 'Others', value: 5, revenue: 410000, color: '#B8860B' }
    ];

    setYearlyData(mockYearlyData);
    setGrowthData(mockGrowthData);
    setCategoryData(mockCategoryData);
  }, [selectedYear]);

  const totalRevenue = yearlyData.reduce((sum, month) => sum + month.revenue, 0);
  const totalSales = yearlyData.reduce((sum, month) => sum + month.sales, 0);
  const totalCustomers = yearlyData.reduce((sum, month) => sum + month.customers, 0);
  const avgMonthlyRevenue = totalRevenue / 12;

  const currentYearGrowth = growthData.length > 1 
    ? ((growthData[growthData.length - 1].revenue - growthData[growthData.length - 2].revenue) / growthData[growthData.length - 2].revenue * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Yearly Sales
          </h1>
          <p className="text-gray-600 mt-2">
            Annual performance analysis and growth trends
          </p>
        </div>
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

      {/* Yearly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              {currentYearGrowth > 0 ? (
                <TrendingUp className="text-green-500 mr-1" size={16} />
              ) : (
                <TrendingDown className="text-red-500 mr-1" size={16} />
              )}
              <p className={`text-sm ${currentYearGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(currentYearGrowth).toFixed(1)}% from last year
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalSales}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Orders completed
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {totalCustomers}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Unique buyers
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Avg Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              ₹{Math.round(avgMonthlyRevenue).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Revenue per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Monthly Performance {selectedYear}</CardTitle>
            <CardDescription>Revenue and sales trends throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Sales'
                  ]}
                />
                <Bar dataKey="revenue" fill="url(#goldGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFA500" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Year-over-Year Growth</CardTitle>
          <CardDescription>Revenue growth trend over the years</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
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
                dot={{ fill: '#FFA500', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Category Performance {selectedYear}</CardTitle>
          <CardDescription>Detailed breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/30 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.value}% of total sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{category.revenue.toLocaleString()}</p>
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
