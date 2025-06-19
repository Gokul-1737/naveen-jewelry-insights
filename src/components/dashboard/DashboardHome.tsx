
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';

interface MonthlyData {
  month: string;
  revenue: number;
  sales: number;
}

interface ProductTypeData {
  name: string;
  value: number;
  color: string;
}

interface SalesData {
  monthly: MonthlyData[];
  productTypes: ProductTypeData[];
}

const DashboardHome = () => {
  const [salesData, setSalesData] = useState<SalesData>({ monthly: [], productTypes: [] });
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  });

  // Mock data - replace with actual Supabase data
  useEffect(() => {
    const mockSalesData: MonthlyData[] = [
      { month: 'Jan', revenue: 45000, sales: 12 },
      { month: 'Feb', revenue: 52000, sales: 15 },
      { month: 'Mar', revenue: 48000, sales: 13 },
      { month: 'Apr', revenue: 61000, sales: 18 },
      { month: 'May', revenue: 55000, sales: 16 },
      { month: 'Jun', revenue: 67000, sales: 20 }
    ];

    const productTypes: ProductTypeData[] = [
      { name: 'Rings', value: 35, color: '#FFD700' },
      { name: 'Necklaces', value: 25, color: '#FFA500' },
      { name: 'Earrings', value: 20, color: '#FF8C00' },
      { name: 'Bracelets', value: 15, color: '#DAA520' },
      { name: 'Others', value: 5, color: '#B8860B' }
    ];

    setSalesData({ monthly: mockSalesData, productTypes });
    setStats({
      todayRevenue: 15000,
      totalSales: 156,
      totalCustomers: 89,
      avgOrderValue: 2500
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, change }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    change?: number;
  }) => (
    <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{change}%</span> from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">Welcome to Naveen Jewelry Stock Management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-600"
          change={12}
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales.toString()}
          icon={ShoppingCart}
          color="text-blue-600"
          change={8}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
          color="text-purple-600"
          change={15}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${stats.avgOrderValue.toLocaleString()}`}
          icon={TrendingUp}
          color="text-amber-600"
          change={5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#666' }}
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

        {/* Product Types Distribution */}
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Product Distribution</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesData.productTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesData.productTypes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Recent Sales</CardTitle>
          <CardDescription>Latest transactions today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { product: 'Diamond Ring', type: 'Ring', amount: 25000, buyer: 'Priya Sharma', time: '2:30 PM' },
              { product: 'Gold Necklace', type: 'Necklace', amount: 35000, buyer: 'Rajesh Kumar', time: '1:15 PM' },
              { product: 'Pearl Earrings', type: 'Earrings', amount: 8000, buyer: 'Anita Singh', time: '12:45 PM' },
            ].map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/30 rounded-lg backdrop-blur-sm">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{sale.product}</h4>
                  <p className="text-sm text-gray-600">{sale.type} • {sale.buyer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{sale.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default DashboardHome;
