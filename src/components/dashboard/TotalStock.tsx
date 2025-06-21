
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TotalStock = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    product_weight_grams: '',
    quantity_available: ''
  });

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to fetch stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
      fetchStockItems();
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast.error('Failed to save stock item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      product_name: item.product_name,
      product_type: item.product_type,
      product_weight_grams: item.product_weight_grams.toString(),
      quantity_available: item.quantity_available.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this stock item?')) return;

    try {
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Stock item deleted successfully');
      fetchStockItems();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Total Stock</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
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
                  <Label htmlFor="product_weight_grams">Weight (grams)</Label>
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
            Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Weight (g)</TableHead>
                  <TableHead>Available Qty</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.product_type}</TableCell>
                    <TableCell>{item.product_weight_grams}g</TableCell>
                    <TableCell>{item.quantity_available}</TableCell>
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
