import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/bill_provider.dart';
import '../utils/invoice_helper.dart';
import '../widgets/customer_search.dart';
import '../widgets/product_item_row.dart';

class CreateBillScreen extends StatelessWidget {
  const CreateBillScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Bill'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Consumer<BillProvider>(
        builder: (context, billProvider, child) {
          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      CustomerSearchWidget(),
                      const SizedBox(height: 24),
                      
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Items',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: () => billProvider.addItem(),
                            icon: const Icon(Icons.add),
                            label: const Text('Add Item'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      ...List.generate(
                        billProvider.items.length,
                        (index) => ProductItemRow(
                          key: ValueKey(index),
                          index: index,
                          item: billProvider.items[index],
                          onRemove: billProvider.items.length > 1
                              ? () => billProvider.removeItem(index)
                              : null,
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      Card(
                        color: Colors.grey[100],
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              _buildTotalRow(
                                'Total Amount:',
                                billProvider.totalAmount,
                              ),
                              const SizedBox(height: 8),
                              _buildTotalRow(
                                'CGST:',
                                billProvider.totalCGST,
                              ),
                              const SizedBox(height: 8),
                              _buildTotalRow(
                                'SGST:',
                                billProvider.totalSGST,
                              ),
                              const Divider(height: 24),
                              _buildTotalRow(
                                'Grand Total:',
                                billProvider.grandTotal,
                                isGrandTotal: true,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 4,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: billProvider.isLoading
                            ? null
                            : () {
                                billProvider.clearBill();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Bill cleared'),
                                    duration: Duration(seconds: 1),
                                  ),
                                );
                              },
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Colors.grey),
                        ),
                        child: const Text(
                          'Clear',
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: billProvider.isLoading
                            ? null
                            : () => _createBill(context, billProvider),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: billProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text(
                                'Create Bill',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
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
            fontSize: isGrandTotal ? 18 : 16,
            fontWeight: isGrandTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          '₹${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isGrandTotal ? 20 : 16,
            fontWeight: isGrandTotal ? FontWeight.bold : FontWeight.w600,
            color: isGrandTotal ? Colors.blue : Colors.black87,
          ),
        ),
      ],
    );
  }

  Future<void> _createBill(BuildContext context, BillProvider billProvider) async {
    try {
      final sale = await billProvider.createBill();

      if (context.mounted) {
        // Show success dialog with print option
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Bill Created Successfully'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Invoice: ${sale.invoiceNumber}'),
                const SizedBox(height: 8),
                Text('Grand Total: ₹${sale.grandTotal.toStringAsFixed(2)}'),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  billProvider.clearBill();
                },
                child: const Text('OK'),
              ),
              ElevatedButton.icon(
                onPressed: () async {
                  Navigator.of(context).pop();
                  await _printInvoice(context, sale.id);
                  billProvider.clearBill();
                },
                icon: const Icon(Icons.print),
                label: const Text('Print'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(billProvider.error ?? 'Failed to create bill'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _printInvoice(BuildContext context, int saleId) async {
    await InvoiceHelper.openInvoice(saleId, context);
  }
}
