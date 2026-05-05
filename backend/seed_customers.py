import pandas as pd
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Customer


def seed_customers():
    # Load Excel
    df = pd.read_excel("../customers.xlsx")

    # Normalize column names
    df.columns = [col.lower().strip() for col in df.columns]

    # Validate required columns
    if "name" not in df.columns:
        print("❌ Excel must contain 'name' column")
        return

    db: Session = SessionLocal()

    inserted = 0
    skipped = 0

    for _, row in df.iterrows():
        name = row.get("name")
        gstin = row.get("gstin")

        # Skip invalid rows
        if not name or pd.isna(name) or str(name).strip() == "":
            skipped += 1
            continue

        # Clean values
        name = str(name).strip()
        gstin = str(gstin).strip() if gstin and not pd.isna(gstin) and str(gstin).strip() != "" else None

        # Avoid duplicate GSTIN
        if gstin:
            existing = db.query(Customer).filter_by(gstin=gstin).first()
            if existing:
                skipped += 1
                continue

        customer = Customer(
            name=name,
            gstin=gstin,
            address=None,
            phone=None,
        )

        db.add(customer)
        inserted += 1

    db.commit()
    db.close()

    print("✅ Upload complete")
    print(f"Inserted: {inserted}")
    print(f"Skipped: {skipped}")


if __name__ == "__main__":
    seed_customers()
