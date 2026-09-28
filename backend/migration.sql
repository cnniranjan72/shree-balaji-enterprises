-- ============================================
-- SAFE MIGRATION SQL
-- Run against Neon PostgreSQL
-- All operations are ADD COLUMN IF NOT EXISTS
-- NEVER drops tables or columns
-- ============================================

-- Ensure products table has all required columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code VARCHAR;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_percentage FLOAT DEFAULT 0.0;

-- Ensure sale_items table has all required GST columns
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS unit VARCHAR;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS taxable_amount FLOAT NOT NULL DEFAULT 0.0;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS cgst FLOAT NOT NULL DEFAULT 0.0;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS sgst FLOAT NOT NULL DEFAULT 0.0;
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS gst_percentage FLOAT DEFAULT 0.0;

-- Ensure sales table has GST columns
ALTER TABLE sales ADD COLUMN IF NOT EXISTS cgst FLOAT DEFAULT 0.0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sgst FLOAT DEFAULT 0.0;

-- Ensure customers table has all columns
ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin VARCHAR;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Ensure products table has created_at
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Ensure sales table has created_at
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Soft delete support: 'active' / 'deleted'. Deleting a bill in the UI only
-- flips this flag, so the row is always recoverable from the Neon console.
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';

-- ============================================
-- BACKFILL: Set defaults for existing rows
-- where new columns might be NULL
-- ============================================

-- Backfill taxable_amount for existing sale_items that have NULL
UPDATE sale_items 
SET taxable_amount = CASE 
    WHEN gst_percentage > 0 THEN ROUND((quantity * rate) / (1 + gst_percentage / 100.0), 2)
    ELSE ROUND(quantity * rate, 2)
END
WHERE taxable_amount = 0 AND amount > 0;

-- Backfill cgst/sgst for existing sale_items
UPDATE sale_items 
SET cgst = ROUND((amount - taxable_amount) / 2.0, 2),
    sgst = ROUND((amount - taxable_amount) / 2.0, 2)
WHERE cgst = 0 AND sgst = 0 AND taxable_amount > 0 AND amount > taxable_amount;

-- Backfill status for any sale row that ended up NULL. Touches nothing that
-- already has a value, so it will never resurrect a deleted bill.
UPDATE sales SET status = 'active' WHERE status IS NULL;

-- ============================================
-- VERIFICATION QUERIES (run manually to check)
-- ============================================
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'sale_items' ORDER BY ordinal_position;
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'sales' ORDER BY ordinal_position;
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position;
