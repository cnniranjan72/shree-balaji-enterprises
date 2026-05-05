import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_config.dart';

class InvoiceHelper {
  /// Opens the invoice in external browser for printing
  /// 
  /// [saleId] - The ID of the sale/invoice
  /// [context] - BuildContext for showing error messages
  static Future<void> openInvoice(int saleId, BuildContext context) async {
    try {
      // Use the web app URL for printing from environment configuration
      final url = Uri.parse(AppConfig.buildWebUrl('/invoice/$saleId'));

      if (await canLaunchUrl(url)) {
        final launched = await launchUrl(
          url,
          mode: LaunchMode.externalApplication,
        );
        
        if (!launched && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not launch invoice page'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not launch invoice page'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to open invoice: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
