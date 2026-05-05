class Product {
  final int id;
  final String name;
  final String? hsnCode;
  final double defaultPrice;
  final double gstPercentage;

  Product({
    required this.id,
    required this.name,
    this.hsnCode,
    required this.defaultPrice,
    required this.gstPercentage,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      hsnCode: json['hsn_code'],
      defaultPrice: (json['default_price'] as num).toDouble(),
      gstPercentage: (json['gst_percentage'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'hsn_code': hsnCode,
      'default_price': defaultPrice,
      'gst_percentage': gstPercentage,
    };
  }
}
