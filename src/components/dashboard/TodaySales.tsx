import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface Sale {
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

interface LeaveAmount {
  id: string;
  product_name: string;
  product_type: string;
  product_weight_grams: number;
  amount: number;
  buyer_name: string;
  quantity: number;
  notes: string;
  leave_date: string;
  created_at: string;
}

const TodaySales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [leaveAmounts, setLeaveAmounts] = useState<LeaveAmount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    product_weight_grams: '',
    amount: '',
    given_amount: '',
    buyer_name: '',
    quantity: '1',
    notes: ''
  });
  const [leaveFormData, setLeaveFormData] = useState({
    product_name: '',
    product_type: '',
    product_weight_grams: '',
    amount: '',
    buyer_name: '',
    quantity: '1',
    notes: ''
  });

  const productTypes = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Chain', 'Bangle', 'Anklet'];

  useEffect(() => {
    fetchSales();
    fetchLeaveAmounts();
  }, [dateRange]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('sale_date', dateRange.from.toISOString().split('T')[0])
          .lte('sale_date', dateRange.to.toISOString().split('T')[0]);
      } else if (dateRange?.from && !dateRange?.to) {
        // Single date selected
        query = query.eq('sale_date', dateRange.from.toISOString().split('T')[0]);
      } else if (!dateRange) {
        // Default to today's sales
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('sale_date', today);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveAmounts = async () => {
    try {
      let query = supabase
        .from('leave_amounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte('leave_date', dateRange.from.toISOString().split('T')[0])
          .lte('leave_date', dateRange.to.toISOString().split('T')[0]);
      } else if (dateRange?.from && !dateRange?.to) {
        // Single date selected
        query = query.eq('leave_date', dateRange.from.toISOString().split('T')[0]);
      } else if (!dateRange) {
        // Default to today's leave amounts
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('leave_date', today);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeaveAmounts(data || []);
    } catch (error) {
      console.error('Error fetching leave amounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave amounts data",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_type: '',
      product_weight_grams: '',
      amount: '',
      given_amount: '',
      buyer_name: '',
      quantity: '1',
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const resetLeaveForm = () => {
    setLeaveFormData({
      product_name: '',
      product_type: '',
      product_weight_grams: '',
      amount: '',
      buyer_name: '',
      quantity: '1',
      notes: ''
    });
    setShowLeaveForm(false);
    setEditingLeaveId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_name || !formData.product_type || !formData.amount || !formData.buyer_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        product_name: formData.product_name.trim(),
        product_type: formData.product_type.trim(),
        product_weight_grams: parseFloat(formData.product_weight_grams) || 0,
        amount: parseFloat(formData.amount),
        given_amount: parseFloat(formData.given_amount) || 0,
        buyer_name: formData.buyer_name.trim(),
        quantity: parseInt(formData.quantity) || 1,
        notes: formData.notes.trim(),
        sale_date: new Date().toISOString().split('T')[0]
      };

      console.log('Saving sale data:', saleData);

      if (editingId) {
        const { error } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sale updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('sales')
          .insert([saleData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sale added successfully - Stock will be updated automatically",
        });
      }

      resetForm();
      fetchSales();
    } catch (error) {
      console.error('Error saving sale:', error);
      toast({
        title: "Error",
        description: "Failed to save sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leaveFormData.product_name || !leaveFormData.product_type || !leaveFormData.amount || !leaveFormData.buyer_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const leaveData = {
        product_name: leaveFormData.product_name.trim(),
        product_type: leaveFormData.product_type.trim(),
        product_weight_grams: parseFloat(leaveFormData.product_weight_grams) || 0,
        amount: parseFloat(leaveFormData.amount),
        buyer_name: leaveFormData.buyer_name.trim(),
        quantity: parseInt(leaveFormData.quantity) || 1,
        notes: leaveFormData.notes.trim(),
        leave_date: new Date().toISOString().split('T')[0]
      };

      console.log('Saving leave amount data:', leaveData);

      if (editingLeaveId) {
        const { error } = await supabase
          .from('leave_amounts')
          .update(leaveData)
          .eq('id', editingLeaveId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Leave amount updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('leave_amounts')
          .insert([leaveData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Leave amount recorded successfully",
        });
      }

      resetLeaveForm();
      fetchLeaveAmounts();
    } catch (error) {
      console.error('Error saving leave amount:', error);
      toast({
        title: "Error",
        description: "Failed to save leave amount",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale: Sale) => {
    setFormData({
      product_name: sale.product_name,
      product_type: sale.product_type,
      product_weight_grams: sale.product_weight_grams.toString(),
      amount: sale.amount.toString(),
      given_amount: sale.given_amount.toString(),
      buyer_name: sale.buyer_name,
      quantity: sale.quantity.toString(),
      notes: sale.notes || ''
    });
    setEditingId(sale.id);
    setShowForm(true);
  };

  const handleEditLeaveAmount = (leave: LeaveAmount) => {
    setLeaveFormData({
      product_name: leave.product_name,
      product_type: leave.product_type,
      product_weight_grams: leave.product_weight_grams.toString(),
      amount: leave.amount.toString(),
      buyer_name: leave.buyer_name,
      quantity: leave.quantity.toString(),
      notes: leave.notes || ''
    });
    setEditingLeaveId(leave.id);
    setShowLeaveForm(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
      
      fetchSales();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaveAmount = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leave_amounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave amount deleted successfully",
      });
      
      fetchLeaveAmounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leave amount",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalGiven = sales.reduce((sum, sale) => sum + sale.given_amount, 0);
  const totalBalance = sales.reduce((sum, sale) => sum + sale.balance_amount, 0);
  const totalLeaveAmount = leaveAmounts.reduce((sum, leave) => sum + leave.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Sales Management
          </h1>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
            <p className="text-gray-600">
              Total Revenue: <span className="font-bold text-green-600">₹{totalRevenue.toLocaleString()}</span>
            </p>
            <p className="text-gray-600">
              Amount Given: <span className="font-bold text-blue-600">₹{totalGiven.toLocaleString()}</span>
            </p>
            <p className="text-gray-600">
              Balance: <span className="font-bold text-red-600">₹{totalBalance.toLocaleString()}</span>
            </p>
            <p className="text-gray-600">
              Leave Amount: <span className="font-bold text-purple-600">₹{totalLeaveAmount.toLocaleString()}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter by date range"
            className="w-full sm:w-auto"
          />
          <Button
            onClick={() => setShowLeaveForm(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
            disabled={loading}
          >
            <Package size={18} className="mr-2" />
            Leave Amount
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
            disabled={loading}
          >
            <Plus size={18} className="mr-2" />
            Add Sale
          </Button>
        </div>
      </div>

      {/* Leave Amount Form */}
      {showLeaveForm && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-gray-800">
              {editingLeaveId ? 'Edit Leave Amount' : 'Record Leave Amount'}
            </CardTitle>
            <CardDescription>
              Enter the details of products left with customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <Input
                  value={leaveFormData.product_name}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Enter product name (e.g., Gold)"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <Select 
                  value={leaveFormData.product_type} 
                  onValueChange={(value) => setLeaveFormData(prev => ({ ...prev, product_type: value }))}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Weight (grams) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={leaveFormData.product_weight_grams}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, product_weight_grams: e.target.value }))}
                  placeholder="Enter weight (e.g., 100)"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={leaveFormData.quantity}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Quantity"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (₹) *
                </label>
                <Input
                  type="number"
                  value={leaveFormData.amount}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter total amount"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name *
                </label>
                <Input
                  value={leaveFormData.buyer_name}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, buyer_name: e.target.value }))}
                  placeholder="Enter buyer name"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Input
                  value={leaveFormData.notes}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200 hover:scale-105"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {editingLeaveId ? 'Update Leave Amount' : 'Record Leave Amount'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetLeaveForm}
                  className="border-gray-300 transition-all duration-200 hover:scale-105"
                  disabled={loading}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales Entry Form */}
      {showForm && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-gray-800">
              {editingId ? 'Edit Sale' : 'Add New Sale'}
            </CardTitle>
            <CardDescription>
              Enter the details of the jewelry sale (Stock will be automatically reduced)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Enter product name (e.g., Gold)"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <Select 
                  value={formData.product_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue placeholder="Select product type (e.g., Chain)" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Weight (grams)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.product_weight_grams}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_weight_grams: e.target.value }))}
                  placeholder="Enter weight per unit (e.g., 100)"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Quantity (e.g., 3)"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (₹) *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter total amount"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Given Amount (₹)
                </label>
                <Input
                  type="number"
                  value={formData.given_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, given_amount: e.target.value }))}
                  placeholder="Amount paid by customer"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name *
                </label>
                <Input
                  value={formData.buyer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyer_name: e.target.value }))}
                  placeholder="Enter buyer name"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 hover:scale-105"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {editingId ? 'Update Sale' : 'Add Sale'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-300 transition-all duration-200 hover:scale-105"
                  disabled={loading}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Sales Records</CardTitle>
          <CardDescription>
            {sales.length} sale{sales.length !== 1 ? 's' : ''} found
            {dateRange?.from && dateRange?.to && (
              <span className="ml-2">
                ({new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()})
              </span>
            )}
            {dateRange?.from && !dateRange?.to && (
              <span className="ml-2">
                ({new Date(dateRange.from).toLocaleDateString()})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sales found for the selected period. Add your first sale above!
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale, index) => (
                <div
                  key={sale.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/30 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 hover:shadow-md hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-gray-800">{sale.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      {sale.product_type} • {sale.product_weight_grams}g • Qty: {sale.quantity} • {sale.buyer_name}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Total: ₹{sale.amount.toLocaleString()}</span>
                      <span>Given: ₹{sale.given_amount.toLocaleString()}</span>
                      <span className={`font-medium ${sale.balance_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: ₹{sale.balance_amount.toLocaleString()}
                      </span>
                    </div>
                    {sale.notes && (
                      <p className="text-xs text-gray-500">{sale.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Sale Date: {new Date(sale.sale_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        ₹{sale.amount.toLocaleString()}
                      </div>
                      {sale.balance_amount > 0 && (
                        <div className="text-sm text-red-600">
                          ₹{sale.balance_amount.toLocaleString()} pending
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(sale)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                        disabled={loading}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Amounts List */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Leave Amount Records</CardTitle>
          <CardDescription>
            {leaveAmounts.length} leave amount{leaveAmounts.length !== 1 ? 's' : ''} found
            {dateRange?.from && dateRange?.to && (
              <span className="ml-2">
                ({new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()})
              </span>
            )}
            {dateRange?.from && !dateRange?.to && (
              <span className="ml-2">
                ({new Date(dateRange.from).toLocaleDateString()})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : leaveAmounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leave amounts found for the selected period. Record your first leave amount above!
            </div>
          ) : (
            <div className="space-y-4">
              {leaveAmounts.map((leave, index) => (
                <div
                  key={leave.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-purple-50/30 rounded-lg backdrop-blur-sm border border-purple-200/20 transition-all duration-200 hover:shadow-md hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-gray-800">{leave.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      {leave.product_type} • {leave.product_weight_grams}g • Qty: {leave.quantity} • {leave.buyer_name}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Amount: ₹{leave.amount.toLocaleString()}</span>
                    </div>
                    {leave.notes && (
                      <p className="text-xs text-gray-500">{leave.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Leave Date: {new Date(leave.leave_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <div className="text-right">
                      <div className="font-bold text-purple-600 text-lg">
                        ₹{leave.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditLeaveAmount(leave)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                        disabled={loading}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteLeaveAmount(leave.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodaySales;
