class SaleItem {
  final int? productId;
  final String description;
  final String? hsnCode;
  final double quantity;
  final double rate;
  final double amount;
  final double gstPercentage;

  SaleItem({
    this.productId,
    required this.description,
    this.hsnCode,
    required this.quantity,
    required this.rate,
    required this.amount,
    required this.gstPercentage,
  });

  factory SaleItem.fromJson(Map<String, dynamic> json) {
    return SaleItem(
      productId: json['product_id'],
      description: json['description'],
      hsnCode: json['hsn_code'],
      quantity: (json['quantity'] as num).toDouble(),
      rate: (json['rate'] as num).toDouble(),
      amount: (json['amount'] as num).toDouble(),
      gstPercentage: (json['gst_percentage'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'description': description,
      'hsn_code': hsnCode,
      'quantity': quantity,
      'rate': rate,
      'amount': amount,
      'gst_percentage': gstPercentage,
    };
  }
}
