class Customer {
  final int id;
  final String name;
  final String? gstin;
  final String? address;
  final String? phone;

  Customer({
    required this.id,
    required this.name,
    this.gstin,
    this.address,
    this.phone,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'],
      name: json['name'],
      gstin: json['gstin'],
      address: json['address'],
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'gstin': gstin,
      'address': address,
      'phone': phone,
    };
  }
}
