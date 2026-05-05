import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/bill_provider.dart';
import '../services/api_service.dart';

class ProductItemRow extends StatefulWidget {
  final int index;
  final BillItem item;
  final VoidCallback? onRemove;

  const ProductItemRow({
    super.key,
    required this.index,
    required this.item,
    this.onRemove,
  });

  @override
  State<ProductItemRow> createState() => _ProductItemRowState();
}

class _ProductItemRowState extends State<ProductItemRow> {
  final ApiService _apiService = ApiService();
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _hsnController = TextEditingController();
  final TextEditingController _quantityController = TextEditingController();
  final TextEditingController _rateController = TextEditingController();
  final TextEditingController _gstController = TextEditingController();

  List<Product> _products = [];
  bool _isSearching = false;
  bool _showSearch = true;

  @override
  void initState() {
    super.initState();
    _descriptionController.text = widget.item.description;
    _hsnController.text = widget.item.hsnCode ?? '';
    _quantityController.text = widget.item.quantity.toString();
    _rateController.text = widget.item.rate.toString();
    _gstController.text = widget.item.gstPercentage.toString();

    if (widget.item.description.isNotEmpty) {
      _showSearch = false;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _descriptionController.dispose();
    _hsnController.dispose();
    _quantityController.dispose();
    _rateController.dispose();
    _gstController.dispose();
    super.dispose();
  }

  Future<void> _searchProducts(String query) async {
    if (query.isEmpty) {
      setState(() {
        _products = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);

    try {
      final products = await _apiService.searchProducts(query);
      setState(() {
        _products = products;
        _isSearching = false;
      });
    } catch (e) {
      setState(() => _isSearching = false);
    }
  }

  void _selectProduct(Product product) {
    context.read<BillProvider>().setItemFromProduct(widget.index, product);
    
    setState(() {
      _descriptionController.text = product.name;
      _hsnController.text = product.hsnCode ?? '';
      _rateController.text = product.defaultPrice.toString();
      _gstController.text = product.gstPercentage.toString();
      _searchController.clear();
      _products = [];
      _showSearch = false;
    });

    _updateItem();
  }

  void _updateItem() {
    final updatedItem = BillItem(
      productId: widget.item.productId,
      description: _descriptionController.text,
      hsnCode: _hsnController.text.isEmpty ? null : _hsnController.text,
      quantity: double.tryParse(_quantityController.text) ?? 1.0,
      rate: double.tryParse(_rateController.text) ?? 0.0,
      gstPercentage: double.tryParse(_gstController.text) ?? 0.0,
    );

    context.read<BillProvider>().updateItem(widget.index, updatedItem);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Item ${widget.index + 1}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const Spacer(),
                if (widget.onRemove != null)
                  IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: widget.onRemove,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            
            if (_showSearch) ...[
              TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search product...',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  suffixIcon: _isSearching
                      ? const Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : null,
                  border: const OutlineInputBorder(),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 12,
                  ),
                  isDense: true,
                ),
                onChanged: (value) {
                  if (value.length >= 2) {
                    _searchProducts(value);
                  } else {
                    setState(() => _products = []);
                  }
                },
              ),
              
              if (_products.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  constraints: const BoxConstraints(maxHeight: 150),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: _products.length,
                    separatorBuilder: (context, index) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final product = _products[index];
                      return ListTile(
                        title: Text(product.name),
                        subtitle: Text('₹${product.defaultPrice} | GST: ${product.gstPercentage}%'),
                        onTap: () => _selectProduct(product),
                        dense: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      );
                    },
                  ),
                ),
              ],
              
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: () => setState(() => _showSearch = false),
                icon: const Icon(Icons.edit, size: 18),
                label: const Text('Enter manually'),
              ),
            ] else ...[
              TextField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description *',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
                onChanged: (_) => _updateItem(),
              ),
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _hsnController,
                      decoration: const InputDecoration(
                        labelText: 'HSN Code',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      onChanged: (_) => _updateItem(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _gstController,
                      decoration: const InputDecoration(
                        labelText: 'GST %',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                      ],
                      onChanged: (_) => _updateItem(),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _quantityController,
                      decoration: const InputDecoration(
                        labelText: 'Quantity *',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                      ],
                      onChanged: (_) => _updateItem(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _rateController,
                      decoration: const InputDecoration(
                        labelText: 'Rate *',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                      ],
                      onChanged: (_) => _updateItem(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.blue[200]!),
                    ),
                    child: Text(
                      '₹${widget.item.amount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ],
              ),
              
              if (_showSearch == false) ...[
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () {
                    setState(() {
                      _showSearch = true;
                      _descriptionController.clear();
                      _hsnController.clear();
                      _rateController.text = '0';
                      _gstController.text = '0';
                    });
                    _updateItem();
                  },
                  icon: const Icon(Icons.search, size: 18),
                  label: const Text('Search product'),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
