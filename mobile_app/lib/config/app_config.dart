class AppConfig {
  // API Base URL - configurable via environment variable
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  // Web Base URL - configurable via environment variable
  static const String webBaseUrl = String.fromEnvironment(
    'WEB_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  // Environment name for debugging
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  // Debug method to print configuration
  static void debugPrintConfig() {
    if (environment == 'development') {
      print('🔧 Flutter App Configuration:');
      print('  API Base URL: $apiBaseUrl');
      print('  Web Base URL: $webBaseUrl');
      print('  Environment: $environment');
    }
  }

  // Helper method to build API URLs
  static String buildApiUrl(String endpoint) {
    return '$apiBaseUrl$endpoint';
  }

  // Helper method to build Web URLs
  static String buildWebUrl(String path) {
    return '$webBaseUrl$path';
  }
}
