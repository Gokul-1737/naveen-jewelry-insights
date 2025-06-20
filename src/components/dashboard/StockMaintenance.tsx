
import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface StockMaintenanceRecord {
  id: string;
  start_date: string;
  end_date: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at: string;
}

const StockMaintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<StockMaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    description: '',
    status: 'scheduled' as const
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_maintenance')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaintenanceRecords(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch maintenance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      status: 'scheduled'
    });
    setDateRange(undefined);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateRange?.from || !dateRange?.to || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const maintenanceData = {
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
        description: formData.description,
        status: formData.status
      };

      if (editingId) {
        const { error } = await supabase
          .from('stock_maintenance')
          .update(maintenanceData)
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Maintenance record updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('stock_maintenance')
          .insert([maintenanceData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Maintenance record added successfully",
        });
      }

      resetForm();
      fetchMaintenanceRecords();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save maintenance record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: StockMaintenanceRecord) => {
    setFormData({
      description: record.description,
      status: record.status
    });
    setDateRange({
      from: new Date(record.start_date),
      to: new Date(record.end_date)
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('stock_maintenance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
      });
      
      fetchMaintenanceRecords();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete maintenance record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Stock Maintenance
          </h1>
          <p className="text-gray-600 mt-2">
            Schedule and track stock maintenance periods
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
          disabled={loading}
        >
          <Plus size={18} className="mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Maintenance Form */}
      {showForm && (
        <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-gray-800">
              {editingId ? 'Edit Maintenance' : 'Schedule New Maintenance'}
            </CardTitle>
            <CardDescription>
              Set the maintenance period and description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  Maintenance Period *
                </label>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  placeholder="Select maintenance period"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the maintenance work"
                  className="bg-white/50 border-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'scheduled' | 'in_progress' | 'completed') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="bg-white/50 border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  disabled={loading}
                >
                  <Save size={16} className="mr-2" />
                  {editingId ? 'Update' : 'Schedule'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-gray-300"
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

      {/* Maintenance Records */}
      <Card className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Maintenance Schedule</CardTitle>
          <CardDescription>
            {maintenanceRecords.length} maintenance record{maintenanceRecords.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
          ) : maintenanceRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No maintenance scheduled yet. Schedule your first maintenance above!
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/30 rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-gray-800">{record.description}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                    </p>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800' :
                      record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(record)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                      disabled={loading}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </Button>
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

export default StockMaintenance;
