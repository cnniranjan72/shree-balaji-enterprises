"""
Run database migrations safely.
Adds missing columns and backfills data.
Safe to run multiple times (idempotent).
"""
import sys
sys.path.insert(0, '.')

from app.database import engine
from sqlalchemy import text

def run_migrations():
    with engine.connect() as conn:
        print("Running migrations...")
        
        # Products table
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code VARCHAR"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS gst_percentage FLOAT DEFAULT 0.0"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()"))
        print("  ✓ Products table updated")
        
        # Sale items table
        conn.execute(text("ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS unit VARCHAR"))
        conn.execute(text("ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS taxable_amount FLOAT NOT NULL DEFAULT 0.0"))
        conn.execute(text("ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS cgst FLOAT NOT NULL DEFAULT 0.0"))
        conn.execute(text("ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS sgst FLOAT NOT NULL DEFAULT 0.0"))
        conn.execute(text("ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS gst_percentage FLOAT DEFAULT 0.0"))
        print("  ✓ Sale_items table updated")
        
        # Sales table
        conn.execute(text("ALTER TABLE sales ADD COLUMN IF NOT EXISTS cgst FLOAT DEFAULT 0.0"))
        conn.execute(text("ALTER TABLE sales ADD COLUMN IF NOT EXISTS sgst FLOAT DEFAULT 0.0"))
        conn.execute(text("ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()"))
        conn.execute(text("ALTER TABLE sales ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active'"))
        print("  ✓ Sales table updated")
        
        # Customers table
        conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS gstin VARCHAR"))
        conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT"))
        conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR"))
        conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()"))
        print("  ✓ Customers table updated")
        
        conn.commit()
        print("\nAll column migrations complete.")
        
        # Backfill taxable_amount for existing sale_items
        result = conn.execute(text("""
            UPDATE sale_items 
            SET taxable_amount = CASE 
                WHEN gst_percentage > 0 THEN ROUND(CAST((quantity * rate) / (1 + gst_percentage / 100.0) AS NUMERIC), 2)
                ELSE ROUND(CAST(quantity * rate AS NUMERIC), 2)
            END
            WHERE taxable_amount = 0 AND amount > 0
        """))
        print(f"  ✓ Backfilled taxable_amount for {result.rowcount} rows")
        
        # Backfill cgst/sgst
        result = conn.execute(text("""
            UPDATE sale_items 
            SET cgst = ROUND(CAST((amount - taxable_amount) / 2.0 AS NUMERIC), 2),
                sgst = ROUND(CAST((amount - taxable_amount) / 2.0 AS NUMERIC), 2)
            WHERE cgst = 0 AND sgst = 0 AND taxable_amount > 0 AND amount > taxable_amount
        """))
        print(f"  ✓ Backfilled cgst/sgst for {result.rowcount} rows")
        
        conn.commit()
        print("\n✅ All migrations and backfills complete!")


if __name__ == "__main__":
    run_migrations()
