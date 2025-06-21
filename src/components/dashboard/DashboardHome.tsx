
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface DashboardStats {
  todayRevenue: number;
  totalSales: number;
  totalCustomers: number;
  avgOrderValue: number;
}

interface RecentSale {
  product_name: string;
  product_type: string;
  amount: number;
  buyer_name: string;
  created_at: string;
}

const DashboardHome = () => {
  const [salesData, setSalesData] = useState<SalesData>({ monthly: [], productTypes: [] });
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTodayStats(),
        fetchMonthlyData(),
        fetchProductTypeData(),
        fetchRecentSales()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's sales
      const { data: todaySales, error: salesError } = await supabase
        .from('sales')
        .select('amount, buyer_name')
        .eq('sale_date', today);

      if (salesError) throw salesError;

      const todayRevenue = todaySales?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0;
      const totalSales = todaySales?.length || 0;
      
      // Get unique customers today
      const uniqueCustomers = new Set(todaySales?.map(sale => sale.buyer_name) || []).size;
      
      // Calculate average order value
      const avgOrderValue = totalSales > 0 ? todayRevenue / totalSales : 0;

      setStats({
        todayRevenue,
        totalSales,
        totalCustomers: uniqueCustomers,
        avgOrderValue
      });
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('amount, sale_date')
        .gte('sale_date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
        .order('sale_date');

      if (error) throw error;

      const monthlyStats: Record<string, { revenue: number; sales: number }> = {};
      
      salesData?.forEach(sale => {
        const month = new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { revenue: 0, sales: 0 };
        }
        monthlyStats[month].revenue += Number(sale.amount);
        monthlyStats[month].sales += 1;
      });

      const monthlyData = Object.entries(monthlyStats).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        sales: data.sales
      }));

      setSalesData(prev => ({ ...prev, monthly: monthlyData }));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchProductTypeData = async () => {
    try {
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('product_type, quantity');

      if (error) throw error;

      const typeStats: Record<string, number> = {};
      
      salesData?.forEach(sale => {
        typeStats[sale.product_type] = (typeStats[sale.product_type] || 0) + sale.quantity;
      });

      const colors = ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'];
      const productTypes = Object.entries(typeStats).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setSalesData(prev => ({ ...prev, productTypes }));
    } catch (error) {
      console.error('Error fetching product type data:', error);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('product_name, product_type, amount, buyer_name, created_at')
        .eq('sale_date', today)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      setRecentSales(salesData || []);
    } catch (error) {
      console.error('Error fetching recent sales:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

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
          title="Today's Sales"
          value={stats.totalSales.toString()}
          icon={ShoppingCart}
          color="text-blue-600"
          change={8}
        />
        <StatCard
          title="Today's Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
          color="text-purple-600"
          change={15}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Math.round(stats.avgOrderValue).toLocaleString()}`}
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
            <CardDescription>Revenue trends over the year</CardDescription>
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
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sales recorded today yet.
              </div>
            ) : (
              recentSales.map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/30 rounded-lg backdrop-blur-sm">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{sale.product_name}</h4>
                    <p className="text-sm text-gray-600">{sale.product_type} • {sale.buyer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{sale.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
