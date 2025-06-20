
-- Add new columns to the sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS product_weight_grams numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS given_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_amount numeric DEFAULT 0;

-- Update the balance_amount calculation trigger
CREATE OR REPLACE FUNCTION calculate_balance_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance_amount = NEW.amount - COALESCE(NEW.given_amount, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate balance amount
DROP TRIGGER IF EXISTS trigger_calculate_balance ON public.sales;
CREATE TRIGGER trigger_calculate_balance
    BEFORE INSERT OR UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION calculate_balance_amount();
