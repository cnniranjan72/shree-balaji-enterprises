# GST Billing Mobile App

Fast, minimal Android billing app for Shree Balaji Enterprises.

## Features

### 1. Create Bill (Main Screen)
- **Search Customer**: Type to search, auto-fill details
- **Search Product**: Type to search, auto-fill price/HSN/GST
- **Manual Entry**: Enter product details manually
- **Edit Prices**: Override default prices per bill
- **Auto Calculate**: Real-time GST calculations (CGST/SGST)
- **Multiple Items**: Add/remove items dynamically
- **Fast Input**: Large buttons, minimal typing

### 2. Bill History
- View all invoices
- See invoice number, date, amount
- Tap to view full details
- Pull to refresh

## Tech Stack

- **Flutter**: UI framework
- **Provider**: State management
- **Dio**: HTTP client
- **Material 3**: Modern UI design

## Setup

### Prerequisites
- Flutter SDK 3.0+
- Android Studio / VS Code
- Android device or emulator

### Installation

1. **Navigate to mobile app directory**
```bash
cd mobile_app
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Configure API URL**

Edit `lib/config/api_config.dart`:

```dart
// For Android Emulator
static const String baseUrl = 'http://10.0.2.2:8000';

// For Physical Device (replace with your computer's IP)
static const String baseUrl = 'http://192.168.1.100:8000';
```

**Finding your computer's IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

4. **Run the app**
```bash
flutter run
```

## Project Structure

```
mobile_app/
├── lib/
│   ├── config/
│   │   └── api_config.dart          # API configuration
│   ├── models/
│   │   ├── customer.dart            # Customer model
│   │   ├── product.dart             # Product model
│   │   ├── sale.dart                # Sale model
│   │   └── sale_item.dart           # Sale item model
│   ├── providers/
│   │   └── bill_provider.dart       # State management
│   ├── screens/
│   │   ├── create_bill_screen.dart  # Main billing screen
│   │   └── history_screen.dart      # Bill history
│   ├── services/
│   │   └── api_service.dart         # API calls
│   ├── widgets/
│   │   ├── customer_search.dart     # Customer search widget
│   │   └── product_item_row.dart    # Product item widget
│   └── main.dart                    # App entry point
├── android/                         # Android configuration
├── pubspec.yaml                     # Dependencies
└── README.md                        # This file
```

## API Endpoints Used

- `GET /customers?search={query}` - Search customers
- `GET /products?search={query}` - Search products
- `POST /sales` - Create bill
- `GET /sales` - Get all sales

## Usage Guide

### Creating a Bill

1. **Select Customer**
   - Tap search field
   - Type customer name/GSTIN/phone
   - Tap customer from results
   - Details auto-fill

2. **Add Items**
   - **Option A - Search Product:**
     - Tap product search
     - Type product name
     - Select from results
     - Details auto-fill
   
   - **Option B - Manual Entry:**
     - Tap "Enter manually"
     - Fill description, HSN, quantity, rate, GST%
     - Amount calculates automatically

3. **Add More Items**
   - Tap "Add Item" button
   - Repeat step 2

4. **Review Totals**
   - Total Amount
   - CGST (auto-calculated)
   - SGST (auto-calculated)
   - Grand Total

5. **Create Bill**
   - Tap "Create Bill" button
   - Success message appears
   - Bill clears for next entry

### Viewing History

1. Tap "History" in bottom navigation
2. See all bills sorted by date
3. Tap any bill to view details
4. Pull down to refresh

## Configuration

### API URL Configuration

**For Android Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:8000';
```
- `10.0.2.2` is the emulator's alias for `localhost`

**For Physical Android Device:**
```dart
static const String baseUrl = 'http://YOUR_COMPUTER_IP:8000';
```
- Replace `YOUR_COMPUTER_IP` with your actual IP
- Ensure phone and computer are on same WiFi network
- Backend must be running on port 8000

**Example:**
```dart
static const String baseUrl = 'http://192.168.1.105:8000';
```

### Timeout Configuration

Default timeout is 30 seconds. To change:

Edit `lib/config/api_config.dart`:
```dart
static const Duration timeout = Duration(seconds: 30);
```

## Building APK

### Debug APK (for testing)
```bash
flutter build apk --debug
```
Output: `build/app/outputs/flutter-apk/app-debug.apk`

### Release APK (for production)
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

### Install APK on Device
```bash
flutter install
```

Or manually:
1. Copy APK to phone
2. Enable "Install from Unknown Sources"
3. Tap APK file to install

## Troubleshooting

### Cannot connect to backend

**Check:**
1. Backend is running (`http://localhost:8000`)
2. API URL is correct in `api_config.dart`
3. For physical device:
   - Phone and computer on same WiFi
   - Firewall allows port 8000
   - Using computer's IP, not localhost

**Test backend:**
```bash
# On computer, visit:
http://localhost:8000

# On phone browser, visit:
http://YOUR_COMPUTER_IP:8000
```

### Search not working

**Check:**
1. Backend has customers/products
2. Search query is at least 2 characters
3. Network connection is active

### App crashes on startup

**Fix:**
```bash
flutter clean
flutter pub get
flutter run
```

### Build errors

**Fix:**
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

## Performance Tips

1. **Fast Billing:**
   - Pre-add frequent customers
   - Pre-add common products
   - Use search (2+ chars) for quick lookup

2. **Offline Mode:**
   - Currently requires internet
   - Future: Add local caching

3. **Battery:**
   - App is lightweight
   - Minimal background activity

## UI Design

### Large Touch Targets
- Buttons: 48dp minimum height
- Input fields: 56dp height
- Easy to tap on phone

### Minimal Typing
- Search instead of typing full names
- Auto-fill from product catalog
- Number pads for quantities/prices

### Fast Navigation
- Bottom navigation bar
- 2 main screens only
- No deep nesting

### Clean Layout
- White backgrounds
- Blue accents
- Clear typography
- Proper spacing

## State Management

Uses **Provider** for simplicity:

- `BillProvider`: Manages bill creation state
  - Selected customer
  - List of items
  - Calculations
  - API calls

## Future Enhancements

- [ ] Offline mode with local database
- [ ] Print invoice from app
- [ ] Share invoice via WhatsApp
- [ ] Barcode scanner
- [ ] Voice input for quantities
- [ ] Dark mode
- [ ] Multiple languages
- [ ] Customer analytics

## Requirements

- **Minimum SDK**: Android 21 (Lollipop 5.0)
- **Target SDK**: Android 33 (Android 13)
- **Permissions**: Internet only

## License

Proprietary - Shree Balaji Enterprises

---

**Version**: 1.0.0  
**Platform**: Android  
**Status**: Production Ready
