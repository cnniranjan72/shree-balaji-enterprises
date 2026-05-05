import 'package:flutter/material.dart';
import '../models/sale.dart';
import '../services/api_service.dart';
import '../utils/invoice_helper.dart';
import 'package:intl/intl.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ApiService _apiService = ApiService();
  List<Sale> _sales = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSales();
  }

  Future<void> _loadSales() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final sales = await _apiService.getSales();
      setState(() {
        _sales = sales;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bill History'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSales,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading sales',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadSales,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_sales.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.receipt_long,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No bills yet',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Create your first bill to see it here',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadSales,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _sales.length,
        itemBuilder: (context, index) {
          final sale = _sales[index];
          return _buildSaleCard(sale);
        },
      ),
    );
  }

  Widget _buildSaleCard(Sale sale) {
    final dateFormat = DateFormat('dd MMM yyyy, hh:mm a');
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => _showSaleDetails(sale),
                    child: Text(
                      sale.invoiceNumber,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green[200]!),
                  ),
                  child: Text(
                    '₹${sale.grandTotal.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[700],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.print, color: Colors.blue),
                  onPressed: () => InvoiceHelper.openInvoice(sale.id, context),
                  tooltip: 'Print Invoice',
                  padding: const EdgeInsets.all(8),
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            if (sale.customer != null) ...[
              Row(
                children: [
                  Icon(Icons.person, size: 16, color: Colors.grey[600]),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      sale.customer!.name,
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.grey[800],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
            ],
            
            Row(
              children: [
                Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                const SizedBox(width: 6),
                Text(
                  dateFormat.format(sale.date),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Row(
              children: [
                _buildInfoChip('Total', '₹${sale.totalAmount.toStringAsFixed(2)}'),
                const SizedBox(width: 8),
                _buildInfoChip('CGST', '₹${sale.cgst.toStringAsFixed(2)}'),
                const SizedBox(width: 8),
                _buildInfoChip('SGST', '₹${sale.sgst.toStringAsFixed(2)}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  void _showSaleDetails(Sale sale) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) {
          return SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                
                Text(
                  sale.invoiceNumber,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  DateFormat('dd MMMM yyyy, hh:mm a').format(sale.date),
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                
                if (sale.customer != null) ...[
                  const SizedBox(height: 24),
                  const Text(
                    'Customer',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(sale.customer!.name, style: const TextStyle(fontSize: 15)),
                  if (sale.customer!.gstin != null)
                    Text('GSTIN: ${sale.customer!.gstin}', style: TextStyle(fontSize: 14, color: Colors.grey[600])),
                ],
                
                if (sale.items != null && sale.items!.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  const Text(
                    'Items',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...sale.items!.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.description,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${item.quantity} × ₹${item.rate.toStringAsFixed(2)}',
                                style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                              ),
                              Text(
                                '₹${item.amount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          if (item.hsnCode != null)
                            Text(
                              'HSN: ${item.hsnCode}',
                              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                            ),
                        ],
                      ),
                    ),
                  )),
                ],
                
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue[200]!),
                  ),
                  child: Column(
                    children: [
                      _buildTotalRow('Total Amount', sale.totalAmount),
                      const SizedBox(height: 8),
                      _buildTotalRow('CGST', sale.cgst),
                      const SizedBox(height: 8),
                      _buildTotalRow('SGST', sale.sgst),
                      const Divider(height: 24),
                      _buildTotalRow('Grand Total', sale.grandTotal, isGrandTotal: true),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTotalRow(String label, double amount, {bool isGrandTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isGrandTotal ? 18 : 15,
            fontWeight: isGrandTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          '₹${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isGrandTotal ? 20 : 15,
            fontWeight: isGrandTotal ? FontWeight.bold : FontWeight.w600,
            color: isGrandTotal ? Colors.blue[700] : Colors.black87,
          ),
        ),
      ],
    );
  }
}
