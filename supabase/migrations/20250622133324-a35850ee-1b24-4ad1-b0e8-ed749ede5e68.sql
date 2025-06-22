
-- Create a table for leave amounts
CREATE TABLE public.leave_amounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  product_weight_grams NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  leave_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_leave_amounts_updated_at
  BEFORE UPDATE ON public.leave_amounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
