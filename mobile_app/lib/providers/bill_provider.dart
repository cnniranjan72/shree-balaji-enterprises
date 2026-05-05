import 'package:flutter/foundation.dart';
import '../models/customer.dart';
import '../models/product.dart';
import '../models/sale_item.dart';
import '../models/sale.dart';
import '../services/api_service.dart';

class BillItem {
  int? productId;
  String description;
  String? hsnCode;
  double quantity;
  double rate;
  double gstPercentage;

  BillItem({
    this.productId,
    this.description = '',
    this.hsnCode,
    this.quantity = 1.0,
    this.rate = 0.0,
    this.gstPercentage = 0.0,
  });

  double get amount => quantity * rate;
  double get gstAmount => (amount * gstPercentage) / 100;
  double get cgst => gstAmount / 2;
  double get sgst => gstAmount / 2;
  double get total => amount + gstAmount;
}

class BillProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  Customer? _selectedCustomer;
  final List<BillItem> _items = [];
  bool _isLoading = false;
  String? _error;

  Customer? get selectedCustomer => _selectedCustomer;
  List<BillItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;

  double get totalAmount {
    return _items.fold(0.0, (sum, item) => sum + item.amount);
  }

  double get totalCGST {
    return _items.fold(0.0, (sum, item) => sum + item.cgst);
  }

  double get totalSGST {
    return _items.fold(0.0, (sum, item) => sum + item.sgst);
  }

  double get grandTotal {
    return totalAmount + totalCGST + totalSGST;
  }

  void setCustomer(Customer customer) {
    _selectedCustomer = customer;
    notifyListeners();
  }

  void addItem() {
    _items.add(BillItem());
    notifyListeners();
  }

  void removeItem(int index) {
    if (_items.length > 1) {
      _items.removeAt(index);
      notifyListeners();
    }
  }

  void updateItem(int index, BillItem item) {
    if (index >= 0 && index < _items.length) {
      _items[index] = item;
      notifyListeners();
    }
  }

  void setItemFromProduct(int index, Product product) {
    if (index >= 0 && index < _items.length) {
      _items[index] = BillItem(
        productId: product.id,
        description: product.name,
        hsnCode: product.hsnCode,
        quantity: _items[index].quantity,
        rate: product.defaultPrice,
        gstPercentage: product.gstPercentage,
      );
      notifyListeners();
    }
  }

  Future<Sale> createBill() async {
    if (_selectedCustomer == null) {
      _error = 'Please select a customer';
      notifyListeners();
      throw Exception('Please select a customer');
    }

    if (_items.isEmpty || _items.every((item) => item.description.isEmpty)) {
      _error = 'Please add at least one item';
      notifyListeners();
      throw Exception('Please add at least one item');
    }

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final saleItems = _items
          .where((item) => item.description.isNotEmpty)
          .map((item) => SaleItem(
                productId: item.productId,
                description: item.description,
                hsnCode: item.hsnCode,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                gstPercentage: item.gstPercentage,
              ))
          .toList();

      final request = CreateSaleRequest(
        customerId: _selectedCustomer!.id,
        items: saleItems,
      );

      final sale = await _apiService.createSale(request);

      _isLoading = false;
      notifyListeners();
      return sale;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  void clearBill() {
    _selectedCustomer = null;
    _items.clear();
    _items.add(BillItem());
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
