from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import datetime
import pandas as pd
import io
from openpyxl.styles import Font, Alignment
from .. import models
from ..database import get_db
from ..config import get_settings

router = APIRouter(prefix="/export", tags=["export"])


def build_export_data(sales):
    """Build export data using stored GST values (not recalculating)."""
    data = []
    for sale in sales:
        for item in sale.items:
            # Use stored values directly - they were calculated correctly at sale time
            data.append({
                "Invoice No": sale.invoice_number,
                "Date": sale.date.strftime("%Y-%m-%d"),
                "Customer Name": sale.customer.name if sale.customer else "Unknown",
                "GSTIN": (sale.customer.gstin or "") if sale.customer else "",
                "Product Name": item.description,
                "HSN": item.hsn_code or "",
                "Unit": item.unit or "",
                "Quantity": item.quantity,
                "Rate": item.rate,
                "Taxable Amount": round(item.taxable_amount, 2),
                "GST %": item.gst_percentage,
                "CGST": round(item.cgst, 2),
                "SGST": round(item.sgst, 2),
                "Total": round(item.amount, 2)
            })
    return data


def write_excel_with_header(df, output, header_title, sub_title):
    """Write DataFrame to Excel with formatted header."""
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sales', startrow=3)
        
        worksheet = writer.sheets['Sales']
        settings = get_settings()
        
        max_col = len(df.columns)
        
        # Merge header rows
        worksheet.merge_cells(start_row=1, start_column=1, end_row=1, end_column=max_col)
        worksheet.merge_cells(start_row=2, start_column=1, end_row=2, end_column=max_col)
        
        # Row 1: Shop name
        cell1 = worksheet.cell(row=1, column=1)
        cell1.value = settings.business_name
        cell1.font = Font(size=14, bold=True)
        cell1.alignment = Alignment(horizontal='center')
        
        # Row 2: Sub title
        cell2 = worksheet.cell(row=2, column=1)
        cell2.value = sub_title
        cell2.font = Font(size=12, bold=True)
        cell2.alignment = Alignment(horizontal='center')
        
        # Add totals row
        start_row = 5  # data starts from row 5
        data_rows = len(df)
        if data_rows > 0:
            last_data_row = start_row + data_rows - 1
            total_row = last_data_row + 1
            
            # Column mapping:
            # Invoice No(1), Date(2), Customer(3), GSTIN(4), Product(5), HSN(6), Unit(7), Qty(8), Rate(9), Taxable(10), GST%(11), CGST(12), SGST(13), Total(14)
            
            # Add "TOTAL" label
            worksheet.cell(row=total_row, column=5).value = "TOTAL"
            worksheet.cell(row=total_row, column=5).font = Font(bold=True)
            worksheet.merge_cells(start_row=total_row, start_column=5, end_row=total_row, end_column=9)
            
            # Taxable Amount total (column 10)
            worksheet.cell(row=total_row, column=10).value = f"=SUM(J{start_row}:J{last_data_row})"
            worksheet.cell(row=total_row, column=10).font = Font(bold=True)
            
            # CGST total (column 12)
            worksheet.cell(row=total_row, column=12).value = f"=SUM(L{start_row}:L{last_data_row})"
            worksheet.cell(row=total_row, column=12).font = Font(bold=True)
            
            # SGST total (column 13)
            worksheet.cell(row=total_row, column=13).value = f"=SUM(M{start_row}:M{last_data_row})"
            worksheet.cell(row=total_row, column=13).font = Font(bold=True)
            
            # Grand Total (column 14)
            worksheet.cell(row=total_row, column=14).value = f"=SUM(N{start_row}:N{last_data_row})"
            worksheet.cell(row=total_row, column=14).font = Font(bold=True)


@router.get("/monthly")
def export_monthly_sales(month: int, year: int, db: Session = Depends(get_db)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
    
    sales = db.query(models.Sale).filter(
        extract('month', models.Sale.date) == month,
        extract('year', models.Sale.date) == year
    ).all()
    
    if not sales:
        raise HTTPException(status_code=404, detail="No sales found for the specified month")
    
    data = build_export_data(sales)
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    
    month_names = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    write_excel_with_header(df, output, "Monthly Sales", f"{month_names[month]} {year} Sales")
    
    output.seek(0)
    
    filename = f"sales_{year}_{month:02d}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/all")
def export_all_sales(db: Session = Depends(get_db)):
    sales = db.query(models.Sale).order_by(models.Sale.date.desc()).all()
    
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
