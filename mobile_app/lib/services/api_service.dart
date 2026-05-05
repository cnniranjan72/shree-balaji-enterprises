import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/customer.dart';
import '../models/product.dart';
import '../models/sale.dart';

class ApiService {
  late final Dio _dio;

  ApiService() {
    // Debug configuration
    AppConfig.debugPrintConfig();
    
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));
  }

  // Customers
  Future<List<Customer>> searchCustomers(String query) async {
    try {
      final response = await _dio.get(
        '/customers/',
        queryParameters: {'search': query},
      );
      return (response.data as List)
          .map((json) => Customer.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to search customers: $e');
    }
  }

  Future<List<Customer>> getCustomers() async {
    try {
      final response = await _dio.get('/customers/');
      return (response.data as List)
          .map((json) => Customer.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load customers: $e');
    }
  }

  // Products
  Future<List<Product>> searchProducts(String query) async {
    try {
      final response = await _dio.get(
        '/products/',
        queryParameters: {'search': query},
      );
      return (response.data as List)
          .map((json) => Product.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to search products: $e');
    }
  }

  Future<List<Product>> getProducts() async {
    try {
      final response = await _dio.get('/products/');
      return (response.data as List)
          .map((json) => Product.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load products: $e');
    }
  }

  // Sales
  Future<Sale> createSale(CreateSaleRequest request) async {
    try {
      final response = await _dio.post(
        '/sales/',
        data: request.toJson(),
      );
      return Sale.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create sale: $e');
    }
  }

  Future<List<Sale>> getSales() async {
    try {
      final response = await _dio.get('/sales/');
      return (response.data as List)
          .map((json) => Sale.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load sales: $e');
    }
  }

  Future<Sale> getSaleById(int id) async {
    try {
      final response = await _dio.get('/sales/$id/');
      return Sale.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load sale: $e');
    }
  }
}
