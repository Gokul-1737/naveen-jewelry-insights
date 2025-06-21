
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShoppingCart, CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BuyingProducts = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterDate, setFilterDate] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    product_weight_grams: '',
    quantity: '',
    buyer_name: '',
    amount: '',
    purchase_date: new Date(),
    notes: ''
  });

  useEffect(() => {
    fetchPurchases();
  }, [filterDate]);

  const fetchPurchases = async () => {
    try {
      let query = supabase
        .from('purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (filterDate) {
        const dateString = format(filterDate, 'yyyy-MM-dd');
        query = query.eq('purchase_date', dateString);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to fetch purchases');
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
        quantity: parseInt(formData.quantity),
        buyer_name: formData.buyer_name,
        amount: parseFloat(formData.amount),
        purchase_date: format(formData.purchase_date, 'yyyy-MM-dd'),
        notes: formData.notes
      };

      const { error } = await supabase
        .from('purchases')
        .insert([data]);

      if (error) throw error;

      toast.success('Purchase recorded successfully');
      setFormData({
        product_name: '',
        product_type: '',
        product_weight_grams: '',
        quantity: '',
        buyer_name: '',
        amount: '',
        purchase_date: new Date(),
        notes: ''
      });
      setShowAddForm(false);
      fetchPurchases();
    } catch (error) {
      console.error('Error recording purchase:', error);
      toast.error('Failed to record purchase');
    }
  };

  const clearFilter = () => {
    setFilterDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buying Products</h1>
          <p className="text-gray-600">Record product purchases and manage inventory</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-green-500 hover:bg-green-600">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Record Purchase
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !filterDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterDate ? format(filterDate, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {filterDate && (
              <Button variant="outline" onClick={clearFilter}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record New Purchase</CardTitle>
            <CardDescription>Add details of a new product purchase</CardDescription>
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buyer_name">Buyer Name</Label>
                  <Input
                    id="buyer_name"
                    value={formData.buyer_name}
                    onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Purchase Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.purchase_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.purchase_date ? format(formData.purchase_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.purchase_date}
                        onSelect={(date) => setFormData({ ...formData, purchase_date: date })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  Record Purchase
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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
            <ShoppingCart className="w-5 h-5" />
            Purchase History
            {filterDate && (
              <span className="text-sm font-normal text-gray-600">
                - {format(filterDate, "PPP")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Weight (g)</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{format(new Date(purchase.purchase_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="font-medium">{purchase.product_name}</TableCell>
                    <TableCell>{purchase.product_type}</TableCell>
                    <TableCell>{purchase.product_weight_grams}g</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>{purchase.buyer_name}</TableCell>
                    <TableCell>₹{purchase.amount}</TableCell>
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

export default BuyingProducts;
