
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Edit, Trash2, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface StockItem {
  id: string;
  product_name: string;
  product_type: string;
  product_weight_grams: number;
  quantity_available: number;
}

interface TodaySale {
  product_name: string;
  product_type: string;
  product_weight_grams: number;
  quantity: number;
}

interface StockWithRemaining extends StockItem {
  today_sold_quantity: number;
  today_sold_weight: number;
  remaining_quantity: number;
  remaining_weight: number;
}

const TotalStock = () => {
  const [stockItems, setStockItems] = useState<StockWithRemaining[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    product_weight_grams: '',
    quantity_available: ''
  });

  useEffect(() => {
    fetchStockWithCalculations();
  }, []);

  const fetchStockWithCalculations = async () => {
    try {
      setLoading(true);
      
      // Fetch stock items
      const { data: stockData, error: stockError } = await supabase
        .from('stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (stockError) {
        console.error('Stock fetch error:', stockError);
        throw stockError;
      }

      // Fetch today's sales
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching sales for date:', today);
      
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('product_name, product_type, product_weight_grams, quantity')
        .eq('sale_date', today);

      if (salesError) {
        console.error('Sales fetch error:', salesError);
        throw salesError;
      }

      console.log('Stock data:', stockData);
      console.log('Today sales data:', salesData);

      // Calculate remaining stock
      const stockWithRemaining: StockWithRemaining[] = (stockData || []).map((stock) => {
        // Find all sales for this specific product (match by name AND type)
        const todaySales = (salesData || []).filter(
          (sale) => 
            sale.product_name.toLowerCase() === stock.product_name.toLowerCase() && 
            sale.product_type.toLowerCase() === stock.product_type.toLowerCase()
        );

        console.log(`Matching sales for ${stock.product_name} (${stock.product_type}):`, todaySales);

        const todayTotalQuantity = todaySales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
        const todayTotalWeight = todaySales.reduce((sum, sale) => {
          const saleWeight = (sale.product_weight_grams || 0) * (sale.quantity || 1);
          return sum + saleWeight;
        }, 0);

        const remainingQuantity = Math.max(0, stock.quantity_available - todayTotalQuantity);
        const totalStockWeight = stock.product_weight_grams * stock.quantity_available;
        const remainingWeight = Math.max(0, totalStockWeight - todayTotalWeight);

        console.log(`${stock.product_name}: Stock(${stock.quantity_available}) - Sold(${todayTotalQuantity}) = Remaining(${remainingQuantity})`);

        return {
          ...stock,
          today_sold_quantity: todayTotalQuantity,
          today_sold_weight: todayTotalWeight,
          remaining_quantity: remainingQuantity,
          remaining_weight: remainingWeight
        };
      });

      setStockItems(stockWithRemaining);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to fetch stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        product_name: formData.product_name,
        product_type: formData.product_type,
        product_weight_grams: parseFloat(formData.product_weight_grams),
        quantity_available: parseInt(formData.quantity_available)
      };

      if (editingItem) {
        const { error } = await supabase
          .from('stock')
          .update(data)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Stock item updated successfully');
      } else {
        const { error } = await supabase
          .from('stock')
          .insert([data]);

        if (error) throw error;
        toast.success('Stock item added successfully');
      }

      setFormData({ product_name: '', product_type: '', product_weight_grams: '', quantity_available: '' });
      setShowAddForm(false);
      setEditingItem(null);
      fetchStockWithCalculations();
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast.error('Failed to save stock item');
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      product_name: item.product_name,
      product_type: item.product_type,
      product_weight_grams: item.product_weight_grams.toString(),
      quantity_available: item.quantity_available.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock item?')) return;

    try {
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Stock item deleted successfully');
      fetchStockWithCalculations();
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast.error('Failed to delete stock item');
    }
  };

  const resetForm = () => {
    setFormData({ product_name: '', product_type: '', product_weight_grams: '', quantity_available: '' });
    setShowAddForm(false);
    setEditingItem(null);
  };

  // Subscribe to real-time changes on sales table
  useEffect(() => {
    const channel = supabase
      .channel('stock-sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          console.log('Sales table changed:', payload);
          fetchStockWithCalculations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Total Stock Management</h1>
          <p className="text-gray-600">Manage your product inventory with real-time remaining stock calculations</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground">Different product types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockItems.reduce((sum, item) => sum + item.today_sold_quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units sold today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Stock</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockItems.reduce((sum, item) => sum + item.remaining_quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units remaining</p>
          </CardContent>
        </Card>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}</CardTitle>
            <CardDescription>
              {editingItem ? 'Update stock item details' : 'Add a new product to your inventory'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_type">Product Type</Label>
                  <Input
                    id="product_type"
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product_weight_grams">Weight per unit (grams)</Label>
                  <Input
                    id="product_weight_grams"
                    type="number"
                    step="0.01"
                    value={formData.product_weight_grams}
                    onChange={(e) => setFormData({ ...formData, product_weight_grams: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity_available">Quantity Available</Label>
                  <Input
                    id="quantity_available"
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                  {editingItem ? 'Update' : 'Add'} Stock
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Stock Items with Remaining Calculations
          </CardTitle>
          <CardDescription>
            Real-time view of total stock minus today's sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Weight/Unit (g)</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Today Sold</TableHead>
                  <TableHead className="text-green-600">Remaining</TableHead>
                  <TableHead>Weight Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.map((item) => (
                  <TableRow key={item.id} className={item.remaining_quantity <= 5 ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.product_type}</TableCell>
                    <TableCell>{item.product_weight_grams}g</TableCell>
                    <TableCell>{item.quantity_available}</TableCell>
                    <TableCell className="text-red-600">
                      {item.today_sold_quantity > 0 ? `-${item.today_sold_quantity}` : '0'}
                    </TableCell>
                    <TableCell className={`font-bold ${item.remaining_quantity <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.remaining_quantity}
                      {item.remaining_quantity <= 5 && item.remaining_quantity > 0 && (
                        <span className="text-xs ml-1">(Low Stock)</span>
                      )}
                      {item.remaining_quantity === 0 && (
                        <span className="text-xs ml-1">(Out of Stock)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Total: {(item.product_weight_grams * item.quantity_available).toFixed(1)}g</div>
                        <div className="text-green-600">Left: {item.remaining_weight.toFixed(1)}g</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TotalStock;
