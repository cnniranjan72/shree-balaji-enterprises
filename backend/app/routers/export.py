from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, extract
from datetime import datetime
import pandas as pd
import io
from openpyxl.styles import Font, Alignment
from .. import models
from ..database import get_db
from ..config import get_settings

router = APIRouter(prefix="/export", tags=["export"])


def build_export_data(sales):
    """Build export data at invoice level - one row per invoice.

    Groups all SaleItems belonging to the same Sale into a single row.
    Item-specific fields (product name, HSN, unit, etc.) are aggregated into
    comma-separated lists. Financial totals (taxable, CGST, SGST, total) are
    summed across all items in the invoice.
    """
    data = []
    for sale in sales:
        items = sale.items
        if not items:
            # Handle edge case: invoice with no items
            data.append({
                "Invoice No": sale.invoice_number,
                "Date": sale.date.strftime("%Y-%m-%d"),
                "Customer Name": sale.customer.name if sale.customer else "Unknown",
                "GSTIN": (sale.customer.gstin or "") if sale.customer else "",
                "Product Name": "",
                "HSN": "",
                "Unit": "",
                "Quantity": "",
                "Rate": "",
                "Taxable Amount": 0.0,
                "GST %": "",
                "CGST": 0.0,
                "SGST": 0.0,
                "Total": 0.0,
            })
            continue

        # Build comma-separated lists for item fields
        product_names = ", ".join([item.description for item in items])
        hsn_codes = ", ".join([item.hsn_code or "" for item in items])
        units = ", ".join([item.unit or "" for item in items])
        quantities = ", ".join([str(item.quantity) for item in items])
        rates = ", ".join([str(item.rate) for item in items])
        gst_percentages = ", ".join([str(item.gst_percentage) for item in items])

        # Compute financial totals across all items
        taxable_sum = round(sum(float(item.taxable_amount or 0) for item in items), 2)
        cgst_sum = round(sum(float(item.cgst or 0) for item in items), 2)
        sgst_sum = round(sum(float(item.sgst or 0) for item in items), 2)
        total_sum = round(sum(float(item.amount or 0) for item in items), 2)

        data.append({
            "Invoice No": sale.invoice_number,
            "Date": sale.date.strftime("%Y-%m-%d"),
            "Customer Name": sale.customer.name if sale.customer else "Unknown",
            "GSTIN": (sale.customer.gstin or "") if sale.customer else "",
            "Product Name": product_names,
            "HSN": hsn_codes,
            "Unit": units,
            "Quantity": quantities,
            "Rate": rates,
            "Taxable Amount": taxable_sum,
            "GST %": gst_percentages,
            "CGST": cgst_sum,
            "SGST": sgst_sum,
            "Total": total_sum,
        })
    return data


def write_excel_with_header(df, output, header_title, sub_title):
    """Write DataFrame to Excel with formatted header and a numeric TOTAL row.

    Layout (Excel 1-indexed):
      Row 1: business name (merged across all columns)
      Row 2: subtitle (merged across all columns)
      Row 3: (empty spacer)
      Row 4: column headers (written by pandas startrow=3)
      Row 5..: one row per exported invoice
      Last data row + 1: TOTAL row (numeric sums, bold) -- strictly AFTER all data rows
    """
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # startrow=3 (0-indexed) -> header at Excel row 4, data from Excel row 5
        df.to_excel(writer, index=False, sheet_name='Sales', startrow=3)

        worksheet = writer.sheets['Sales']
        settings = get_settings()

        max_col = len(df.columns)

        worksheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=max_col)
        worksheet.merge_cells(start_row=2, start_column=1, end_row=2, end_column=max_col)

        cell1 = worksheet.cell(row=1, column=1)
        cell1.value = settings.business_name
        cell1.font = Font(size=14, bold=True)
        cell1.alignment = Alignment(horizontal='center')

        cell2 = worksheet.cell(row=2, column=1)
        cell2.value = sub_title
        cell2.font = Font(size=12, bold=True)
        cell2.alignment = Alignment(horizontal='center')

        # Data starts at Excel row 5 (pandas startrow=3 -> header row 4, data row 5+)
        start_row = 5
        data_rows = len(df)

        if data_rows > 0:
            last_data_row = start_row + data_rows - 1
            total_row = last_data_row + 1

            # Column mapping (Excel columns, 1-indexed):
            # 1=Invoice, 2=Date, 3=Customer, 4=GSTIN, 5=Product, 6=HSN, 7=Unit,
            # 8=Qty, 9=Rate, 10=Taxable, 11=GST%, 12=CGST, 13=SGST, 14=Total
            col_taxable = 10
            col_cgst = 12
            col_sgst = 13
            col_total = 14
            col_product = 5

            # "TOTAL" label spanning product/description columns only
            worksheet.cell(row=total_row, column=col_product).value = "TOTAL"
            worksheet.cell(row=total_row, column=col_product).font = Font(bold=True)
            worksheet.merge_cells(
                start_row=total_row, start_column=col_product,
                end_row=total_row, end_column=col_product + 4
            )

            # Numeric totals computed in Python (guaranteed to display in any viewer).
            # Write actual numeric values AND bold them; no formulas that might
            # be dropped by tools that don't evaluate SUM(). Data rows above are
            # never modified.
            taxable_sum = round(df['Taxable Amount'].sum(), 2)
            cgst_sum = round(df['CGST'].sum(), 2)
            sgst_sum = round(df['SGST'].sum(), 2)
            total_sum = round(df['Total'].sum(), 2)

            worksheet.cell(row=total_row, column=col_taxable).value = taxable_sum
            worksheet.cell(row=total_row, column=col_taxable).font = Font(bold=True)

            worksheet.cell(row=total_row, column=col_cgst).value = cgst_sum
            worksheet.cell(row=total_row, column=col_cgst).font = Font(bold=True)

            worksheet.cell(row=total_row, column=col_sgst).value = sgst_sum
            worksheet.cell(row=total_row, column=col_sgst).font = Font(bold=True)

            worksheet.cell(row=total_row, column=col_total).value = total_sum
            worksheet.cell(row=total_row, column=col_total).font = Font(bold=True)


@router.get("/monthly")
def export_monthly_sales(
    month: int,
    year: int,
    db: Session = Depends(get_db)
):
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=400,
            detail="Invalid month. Month must be between 1 and 12."
        )

    # Calculate start and end of requested month
    start_date = datetime(year, month, 1)

    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    # IMPORTANT:
    # One Sale = One invoice.
    # build_export_data() converts each Sale into exactly ONE Excel row.
    sales = (
        db.query(models.Sale)
        .filter(
            models.Sale.date >= start_date,
            models.Sale.date < end_date,
            or_(
                models.Sale.status == "active",
                models.Sale.status.is_(None)
            )
        )
        .order_by(models.Sale.date.asc())
        .all()
    )

    if not sales:
        raise HTTPException(
            status_code=404,
            detail=f"No active sales found for {month:02d}/{year}"
        )

    # One invoice = one row.
    # Multiple products inside the invoice are comma-separated.
    data = build_export_data(sales)

    df = pd.DataFrame(data)

    output = io.BytesIO()

    month_names = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    write_excel_with_header(
        df,
        output,
        "Monthly Sales",
        f"{month_names[month]} {year} Sales"
    )

    output.seek(0)

    filename = f"sales_{year}_{month:02d}.xlsx"

    return StreamingResponse(
        output,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/all")
def export_all_sales(db: Session = Depends(get_db)):
    sales = (
        db.query(models.Sale)
        .filter(
            or_(
                models.Sale.status == "active",
                models.Sale.status.is_(None)
            )
        )
        .order_by(models.Sale.date.asc())
        .all()
    )
    
    if not sales:
        raise HTTPException(status_code=404, detail="No sales found")
    
    data = build_export_data(sales)
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    write_excel_with_header(df, output, "All Sales", "All Sales")
    
    output.seek(0)
    
    filename = f"all_sales_{datetime.now().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )