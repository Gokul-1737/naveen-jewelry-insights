
-- Create a table for stock management
CREATE TABLE public.stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_weight_grams NUMERIC NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for product purchases (buying)
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_weight_grams NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  buyer_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger to update stock when sales are made
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Reduce stock when a sale is made
    UPDATE public.stock 
    SET quantity_available = quantity_available - NEW.quantity,
        updated_at = now()
    WHERE product_name = NEW.product_name 
    AND product_type = NEW.product_type;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to increase stock when purchases are made
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if product exists in stock
    IF EXISTS (
        SELECT 1 FROM public.stock 
        WHERE product_name = NEW.product_name 
        AND product_type = NEW.product_type
    ) THEN
        -- Update existing stock
        UPDATE public.stock 
        SET quantity_available = quantity_available + NEW.quantity,
            product_weight_grams = NEW.product_weight_grams,
            updated_at = now()
        WHERE product_name = NEW.product_name 
        AND product_type = NEW.product_type;
    ELSE
        -- Insert new stock entry
        INSERT INTO public.stock (product_name, product_type, product_weight_grams, quantity_available)
        VALUES (NEW.product_name, NEW.product_type, NEW.product_weight_grams, NEW.quantity);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_stock_on_sale ON public.sales;
CREATE TRIGGER trigger_update_stock_on_sale
    AFTER INSERT ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_sale();

DROP TRIGGER IF EXISTS trigger_update_stock_on_purchase ON public.purchases;
CREATE TRIGGER trigger_update_stock_on_purchase
    AFTER INSERT ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_purchase();

-- Add updated_at trigger for all tables
DROP TRIGGER IF EXISTS trigger_updated_at_stock ON public.stock;
CREATE TRIGGER trigger_updated_at_stock
    BEFORE UPDATE ON public.stock
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_updated_at_purchases ON public.purchases;
CREATE TRIGGER trigger_updated_at_purchases
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
