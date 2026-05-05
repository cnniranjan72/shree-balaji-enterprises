import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/customer.dart';
import '../providers/bill_provider.dart';
import '../services/api_service.dart';

class CustomerSearchWidget extends StatefulWidget {
  const CustomerSearchWidget({super.key});

  @override
  State<CustomerSearchWidget> createState() => _CustomerSearchWidgetState();
}

class _CustomerSearchWidgetState extends State<CustomerSearchWidget> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  List<Customer> _customers = [];
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchCustomers(String query) async {
    if (query.isEmpty) {
      setState(() {
        _customers = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);

    try {
      final customers = await _apiService.searchCustomers(query);
      setState(() {
        _customers = customers;
        _isSearching = false;
      });
    } catch (e) {
      setState(() => _isSearching = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error searching customers: $e')),
        );
      }
    }
  }

  void _selectCustomer(Customer customer) {
    context.read<BillProvider>().setCustomer(customer);
    _searchController.clear();
    setState(() => _customers = []);
  }

  @override
  Widget build(BuildContext context) {
    final selectedCustomer = context.watch<BillProvider>().selectedCustomer;

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Customer',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            
            if (selectedCustomer == null) ...[
              TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search customer...',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: _isSearching
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : null,
                  border: const OutlineInputBorder(),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                ),
                onChanged: (value) {
                  if (value.length >= 2) {
                    _searchCustomers(value);
                  } else {
                    setState(() => _customers = []);
                  }
                },
                style: const TextStyle(fontSize: 16),
              ),
              
              if (_customers.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  constraints: const BoxConstraints(maxHeight: 200),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: _customers.length,
                    separatorBuilder: (context, index) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final customer = _customers[index];
                      return ListTile(
                        title: Text(
                          customer.name,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text(
                          customer.gstin ?? 'No GSTIN',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                        onTap: () => _selectCustomer(customer),
                        dense: true,
                      );
                    },
                  ),
                ),
              ],
            ] else ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.blue[200]!),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            selectedCustomer.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (selectedCustomer.gstin != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              'GSTIN: ${selectedCustomer.gstin}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[700],
                              ),
                            ),
                          ],
                          if (selectedCustomer.phone != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              'Phone: ${selectedCustomer.phone}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[700],
                              ),
                            ),
                          ],
                          if (selectedCustomer.address != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              selectedCustomer.address!,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey[600],
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.red),
                      onPressed: () {
                        context.read<BillProvider>().setCustomer(
                          Customer(id: 0, name: ''),
                        );
                        context.read<BillProvider>().clearBill();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
