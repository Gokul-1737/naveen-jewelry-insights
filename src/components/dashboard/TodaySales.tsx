
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const TodaySales = () => {
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    productType: '',
    amount: '',
    buyerName: '',
    quantity: 1,
    notes: ''
  });

  const productTypes = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Chain', 'Bangle', 'Anklet'];

  // Mock data - replace with Supabase data
  useEffect(() => {
    const mockSales = [
      {
        id: 1,
        productName: 'Diamond Ring',
        productType: 'Ring',
        amount: 25000,
        buyerName: 'Priya Sharma',
        quantity: 1,
        notes: 'Engagement ring',
        saleDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toLocaleTimeString()
      },
      {
        id: 2,
        productName: 'Gold Necklace',
        productType: 'Necklace',
        amount: 35000,
        buyerName: 'Rajesh Kumar',
        quantity: 1,
        notes: 'Wedding jewelry',
        saleDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toLocaleTimeString()
      }
    ];
    setSales(mockSales);
  }, []);

  const resetForm = () => {
    setFormData({
      productName: '',
      productType: '',
      amount: '',
      buyerName: '',
      quantity: 1,
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.productType || !formData.amount || !formData.buyerName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const saleData = {
      ...formData,
      amount: parseFloat(formData.amount),
      quantity: parseInt(formData.quantity),
      saleDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleTimeString()
    };

    if (editingId) {
      // Update existing sale
      setSales(prev => prev.map(sale => 
        sale.id === editingId ? { ...sale, ...saleData } : sale
      ));
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
    } else {
      // Add new sale
      const newSale = {
        id: Date.now(),
        ...saleData
      };
      setSales(prev => [newSale, ...prev]);
      toast({
        title: "Success",
        description: "Sale added successfully",
      });
    }

    resetForm();
  };

  const handleEdit = (sale) => {
    setFormData({
      productName: sale.productName,
      productType: sale.productType,
      amount: sale.amount.toString(),
      buyerName: sale.buyerName,
      quantity: sale.quantity,
      notes: sale.notes || ''
    });
    setEditingId(sale.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
    toast({
      title: "Success",
      description: "Sale deleted successfully",
    });
  };

  const todayTotal = sales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Today's Sales
          </h1>
          <p className="text-gray-600 mt-2">
            Total Revenue: <span className="font-bold text-green-600">₹{todayTotal.toLocaleString()}</span>
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg"
        >
          <Plus size={18} className="mr-2" />
          Add Sale
        </Button>
      </div>

      {/* Sales Entry Form */}
      {showForm && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
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
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Enter product name"
                  className="bg-white/50 border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type *
                </label>
                <Select 
                  value={formData.productType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, productType: value }))}
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
                  className="bg-white/50 border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name *
                </label>
                <Input
                  value={formData.buyerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                  placeholder="Enter buyer name"
                  className="bg-white/50 border-white/30"
                  required
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
                  className="bg-white/50 border-white/30"
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
                  className="bg-white/50 border-white/30"
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Save size={16} className="mr-2" />
                  {editingId ? 'Update Sale' : 'Add Sale'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-300"
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
          <CardTitle className="text-gray-800">Today's Sales Records</CardTitle>
          <CardDescription>
            {sales.length} sale{sales.length !== 1 ? 's' : ''} recorded today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sales recorded today. Add your first sale above!
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/30 rounded-lg backdrop-blur-sm border border-white/20"
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-gray-800">{sale.productName}</h4>
                    <p className="text-sm text-gray-600">
                      {sale.productType} • Qty: {sale.quantity} • {sale.buyerName}
                    </p>
                    {sale.notes && (
                      <p className="text-xs text-gray-500">{sale.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">Added at {sale.createdAt}</p>
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
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
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
