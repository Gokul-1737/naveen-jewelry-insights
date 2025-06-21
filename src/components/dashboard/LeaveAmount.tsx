
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LeaveAmountRecord {
  id: string;
  buyer_name: string;
  product_name: string;
  product_type: string;
  amount: number;
  product_weight_grams: number;
  quantity: number;
  leave_date: string;
  notes?: string;
  created_at: string;
}

const LeaveAmount = () => {
  const [leaveRecords, setLeaveRecords] = useState<LeaveAmountRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    buyer_name: '',
    product_name: '',
    product_type: '',
    amount: '',
    product_weight_grams: '',
    quantity: '1',
    notes: ''
  });

  const productTypes = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Pendant', 'Chain', 'Bangle', 'Anklet'];

  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  const fetchLeaveRecords = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('leave_amounts')
        .select('*')
        .eq('leave_date', today)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRecords(data || []);
    } catch (error) {
      console.error('Error fetching leave records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave amount records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      buyer_name: '',
      product_name: '',
      product_type: '',
      amount: '',
      product_weight_grams: '',
      quantity: '1',
      notes: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buyer_name || !formData.product_name || !formData.product_type || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const recordData = {
        buyer_name: formData.buyer_name.trim(),
        product_name: formData.product_name.trim(),
        product_type: formData.product_type.trim(),
        amount: parseFloat(formData.amount),
        product_weight_grams: parseFloat(formData.product_weight_grams) || 0,
        quantity: parseInt(formData.quantity) || 1,
        notes: formData.notes.trim(),
        leave_date: new Date().toISOString().split('T')[0]
      };

      if (editingId) {
        const { error } = await supabase
          .from('leave_amounts')
          .update(recordData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Leave amount record updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('leave_amounts')
          .insert([recordData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Leave amount record added successfully",
        });
      }

      resetForm();
      fetchLeaveRecords();
    } catch (error) {
      console.error('Error saving leave record:', error);
      toast({
        title: "Error",
        description: "Failed to save leave amount record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: LeaveAmountRecord) => {
    setFormData({
      buyer_name: record.buyer_name,
      product_name: record.product_name,
      product_type: record.product_type,
      amount: record.amount.toString(),
      product_weight_grams: record.product_weight_grams.toString(),
      quantity: record.quantity.toString(),
      notes: record.notes || ''
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('leave_amounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave amount record deleted successfully",
      });
      
      fetchLeaveRecords();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leave amount record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalLeaveAmount = leaveRecords.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Leave Amount Management
          </h1>
          <p className="text-gray-600 mt-2">
            Total Leave Amount Today: <span className="font-bold text-red-600">₹{totalLeaveAmount.toLocaleString()}</span>
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
          disabled={loading}
        >
          <Plus size={18} className="mr-2" />
          Add Leave Amount
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-gray-800">
              {editingId ? 'Edit Leave Amount' : 'Add New Leave Amount'}
            </CardTitle>
            <CardDescription>
              Enter the details of the leave amount record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name *
                </label>
                <Input
                  value={formData.buyer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyer_name: e.target.value }))}
                  placeholder="Enter buyer name"
                  className="bg-white/50 border-white/30"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <Input
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="Enter product name"
                  className="bg-white/50 border-white/30"
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
                  className="bg-white/50 border-white/30"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (grams)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.product_weight_grams}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_weight_grams: e.target.value }))}
                  placeholder="Enter weight"
                  className="bg-white/50 border-white/30"
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
                  placeholder="Enter quantity"
                  className="bg-white/50 border-white/30"
                  required
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                  className="bg-white/50 border-white/30"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {editingId ? 'Update Record' : 'Add Record'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
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

      {/* Records List */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Today's Leave Amount Records</CardTitle>
          <CardDescription>
            {leaveRecords.length} record{leaveRecords.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : leaveRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leave amount records found for today. Add your first record above!
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/30 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 hover:shadow-md hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-gray-800">{record.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      {record.product_type} • {record.product_weight_grams}g • Qty: {record.quantity} • {record.buyer_name}
                    </p>
                    {record.notes && (
                      <p className="text-xs text-gray-500">{record.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <div className="text-right">
                      <div className="font-bold text-red-600 text-lg">
                        ₹{record.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        disabled={loading}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
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

export default LeaveAmount;
