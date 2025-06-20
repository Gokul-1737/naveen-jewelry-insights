
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar } from 'lucide-react';
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
  amount: number;
  buyer_name: string;
  quantity: number;
  notes: string;
  sale_date: string;
  created_at: string;
}

const TodaySales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    amount: '',
    buyer_name: '',
    quantity: '1',
    notes: ''
  });

  const productTypes = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Chain', 'Bangle', 'Anklet'];

  useEffect(() => {
    fetchSales();
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
      } else if (!dateRange) {
        // Default to today's sales
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('sale_date', today);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_type: '',
      amount: '',
      buyer_name: '',
      quantity: '1',
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
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
        product_name: formData.product_name,
        product_type: formData.product_type,
        amount: parseFloat(formData.amount),
        buyer_name: formData.buyer_name,
        quantity: parseInt(formData.quantity) || 1,
        notes: formData.notes,
        sale_date: new Date().toISOString().split('T')[0]
      };

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
          description: "Sale added successfully",
        });
      }

      resetForm();
      fetchSales();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sale",
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
      amount: sale.amount.toString(),
      buyer_name: sale.buyer_name,
      quantity: sale.quantity.toString(),
      notes: sale.notes || ''
    });
    setEditingId(sale.id);
    setShowForm(true);
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

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Sales Management
          </h1>
          <p className="text-gray-600 mt-2">
            Total Revenue: <span className="font-bold text-green-600">₹{totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Filter by date range"
            className="w-full sm:w-auto"
          />
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

      {/* Sales Entry Form */}
      {showForm && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-gray-800">
              {editingId ? 'Edit Sale' : 'Add New Sale'}
            </CardTitle>
            <CardDescription>
              Enter the details of the jewelry sale
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
                  placeholder="Enter product name"
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
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                  required
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
                  Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="1"
                  className="bg-white/50 border-white/30 transition-all duration-200 focus:ring-2 focus:ring-amber-500"
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
                      {sale.product_type} • Qty: {sale.quantity} • {sale.buyer_name}
                    </p>
                    {sale.notes && (
                      <p className="text-xs text-gray-500">{sale.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Sale Date: {new Date(sale.sale_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <span className="font-bold text-green-600 text-lg">
                      ₹{sale.amount.toLocaleString()}
                    </span>
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
    </div>
  );
};

export default TodaySales;
