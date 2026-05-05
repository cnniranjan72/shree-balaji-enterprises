import 'customer.dart';
import 'sale_item.dart';

class Sale {
  final int id;
  final String invoiceNumber;
  final int customerId;
  final DateTime date;
  final double totalAmount;
  final double cgst;
  final double sgst;
  final double grandTotal;
  final Customer? customer;
  final List<SaleItem>? items;

  Sale({
    required this.id,
    required this.invoiceNumber,
    required this.customerId,
    required this.date,
    required this.totalAmount,
    required this.cgst,
    required this.sgst,
    required this.grandTotal,
    this.customer,
    this.items,
  });

  factory Sale.fromJson(Map<String, dynamic> json) {
    return Sale(
      id: json['id'],
      invoiceNumber: json['invoice_number'],
      customerId: json['customer_id'],
      date: DateTime.parse(json['date']),
      totalAmount: (json['total_amount'] as num).toDouble(),
      cgst: (json['cgst'] as num).toDouble(),
      sgst: (json['sgst'] as num).toDouble(),
      grandTotal: (json['grand_total'] as num).toDouble(),
      customer: json['customer'] != null 
          ? Customer.fromJson(json['customer']) 
          : null,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => SaleItem.fromJson(item))
              .toList()
          : null,
    );
  }
}

class CreateSaleRequest {
  final int customerId;
  final List<SaleItem> items;

  CreateSaleRequest({
    required this.customerId,
    required this.items,
  });

  Map<String, dynamic> toJson() {
    return {
      'customer_id': customerId,
      'items': items.map((item) => item.toJson()).toList(),
    };
  }
}
