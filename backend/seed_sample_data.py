import requests
import json

BASE_URL = "http://localhost:8000"

def create_sample_customers():
    customers = [
        {
            "name": "Rajesh Kumar",
            "gstin": "27AABCU9603R1ZM",
            "address": "123 MG Road, Mumbai, Maharashtra - 400001",
            "phone": "+91-9876543210"
        },
        {
            "name": "Priya Sharma",
            "gstin": "29AABCU9603R1ZN",
            "address": "456 Brigade Road, Bangalore, Karnataka - 560001",
            "phone": "+91-9876543211"
        },
        {
            "name": "Amit Patel",
            "gstin": "24AABCU9603R1ZO",
            "address": "789 CG Road, Ahmedabad, Gujarat - 380001",
            "phone": "+91-9876543212"
        },
        {
            "name": "Sneha Reddy",
            "gstin": None,
            "address": "321 Banjara Hills, Hyderabad, Telangana - 500034",
            "phone": "+91-9876543213"
        },
        {
            "name": "Vikram Singh",
            "gstin": "07AABCU9603R1ZP",
            "address": "654 Connaught Place, New Delhi - 110001",
            "phone": "+91-9876543214"
        }
    ]
    
    print("Creating sample customers...")
    for customer in customers:
        try:
            response = requests.post(f"{BASE_URL}/customers", json=customer)
            if response.status_code == 200:
                print(f"✓ Created customer: {customer['name']}")
            else:
                print(f"✗ Failed to create customer: {customer['name']}")
        except Exception as e:
            print(f"✗ Error creating customer {customer['name']}: {e}")

def create_sample_products():
    products = [
        {
            "name": "Rice (Premium Basmati)",
            "hsn_code": "1006",
            "default_price": 150.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Wheat Flour",
            "hsn_code": "1101",
            "default_price": 45.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Sugar",
            "hsn_code": "1701",
            "default_price": 42.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Cooking Oil (Sunflower)",
            "hsn_code": "1512",
            "default_price": 180.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Pulses (Toor Dal)",
            "hsn_code": "0713",
            "default_price": 120.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Tea Powder",
            "hsn_code": "0902",
            "default_price": 250.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Coffee Powder",
            "hsn_code": "0901",
            "default_price": 350.00,
            "gst_percentage": 5.0
        },
        {
            "name": "Biscuits",
            "hsn_code": "1905",
            "default_price": 50.00,
            "gst_percentage": 12.0
        },
        {
            "name": "Soap",
            "hsn_code": "3401",
            "default_price": 35.00,
            "gst_percentage": 18.0
        },
        {
            "name": "Detergent Powder",
            "hsn_code": "3402",
            "default_price": 85.00,
            "gst_percentage": 18.0
        }
    ]
    
    print("\nCreating sample products...")
    for product in products:
        try:
            response = requests.post(f"{BASE_URL}/products", json=product)
            if response.status_code == 200:
                print(f"✓ Created product: {product['name']}")
            else:
                print(f"✗ Failed to create product: {product['name']}")
        except Exception as e:
            print(f"✗ Error creating product {product['name']}: {e}")

def create_sample_sale():
    print("\nCreating sample sale...")
    
    try:
        customers_response = requests.get(f"{BASE_URL}/customers")
        products_response = requests.get(f"{BASE_URL}/products")
        
        if customers_response.status_code != 200 or products_response.status_code != 200:
            print("✗ Failed to fetch customers or products")
            return
        
        customers = customers_response.json()
        products = products_response.json()
        
        if not customers or not products:
            print("✗ No customers or products available")
            return
        
        sale_data = {
            "customer_id": customers[0]["id"],
            "items": [
                {
                    "product_id": products[0]["id"],
                    "description": products[0]["name"],
                    "hsn_code": products[0]["hsn_code"],
                    "quantity": 2,
                    "rate": products[0]["default_price"],
                    "amount": 2 * products[0]["default_price"],
                    "gst_percentage": products[0]["gst_percentage"]
                },
                {
                    "product_id": products[1]["id"],
                    "description": products[1]["name"],
                    "hsn_code": products[1]["hsn_code"],
                    "quantity": 5,
                    "rate": products[1]["default_price"],
                    "amount": 5 * products[1]["default_price"],
                    "gst_percentage": products[1]["gst_percentage"]
                },
                {
                    "product_id": None,
                    "description": "Custom Item - Special Package",
                    "hsn_code": "9999",
                    "quantity": 1,
                    "rate": 500.00,
                    "amount": 500.00,
                    "gst_percentage": 18.0
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/sales", json=sale_data)
        if response.status_code == 200:
            sale = response.json()
            print(f"✓ Created sample sale: {sale['invoice_number']}")
            print(f"  Customer: {sale['customer']['name']}")
            print(f"  Items: {len(sale['items'])}")
            print(f"  Grand Total: ₹{sale['grand_total']}")
        else:
            print(f"✗ Failed to create sale: {response.text}")
    except Exception as e:
        print(f"✗ Error creating sale: {e}")

def main():
    print("=" * 60)
    print("  GST Billing System - Sample Data Generator")
    print("=" * 60)
    print("\nMake sure the backend is running on http://localhost:8000")
    print("\nThis will create:")
    print("  - 5 sample customers")
    print("  - 10 sample products")
    print("  - 1 sample invoice")
    print("\n" + "=" * 60 + "\n")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("✗ Backend is not responding. Please start the backend first.")
            return
    except Exception as e:
        print("✗ Cannot connect to backend. Please start the backend first.")
        print(f"  Error: {e}")
        return
    
    create_sample_customers()
    create_sample_products()
    create_sample_sale()
    
    print("\n" + "=" * 60)
    print("✓ Sample data created successfully!")
    print("=" * 60)
    print("\nYou can now:")
    print("  1. View customers at http://localhost:3000/customers")
    print("  2. View products at http://localhost:3000/products")
    print("  3. View sales at http://localhost:3000/sales")
    print("  4. Create new bills at http://localhost:3000/create-bill")
    print("\n")

if __name__ == "__main__":
    main()
