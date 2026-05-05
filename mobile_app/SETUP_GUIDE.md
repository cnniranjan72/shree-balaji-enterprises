# Mobile App Setup Guide

## Quick Start (5 Minutes)

### Step 1: Install Flutter

**Windows:**
1. Download Flutter SDK: https://flutter.dev/docs/get-started/install/windows
2. Extract to `C:\src\flutter`
3. Add to PATH: `C:\src\flutter\bin`
4. Run: `flutter doctor`

**Mac:**
```bash
brew install flutter
flutter doctor
```

**Linux:**
```bash
sudo snap install flutter --classic
flutter doctor
```

### Step 2: Setup Android

1. **Install Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK
   - Install Android Emulator

2. **Accept Licenses**
```bash
flutter doctor --android-licenses
```

### Step 3: Setup Project

```bash
cd mobile_app
flutter pub get
```

### Step 4: Configure API

Edit `lib/config/api_config.dart`:

**For Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:8000';
```

**For Physical Device:**
```dart
static const String baseUrl = 'http://192.168.1.XXX:8000';
```

Replace `XXX` with your computer's IP address.

**Find Your IP:**
- Windows: `ipconfig` → IPv4 Address
- Mac: `ifconfig en0 | grep inet`
- Linux: `ip addr show`

### Step 5: Run Backend

Ensure backend is running:
```bash
cd backend
python run.py
```

Backend should be at: `http://localhost:8000`

### Step 6: Run App

**Using Emulator:**
```bash
flutter emulators
flutter emulators --launch <emulator_id>
flutter run
```

**Using Physical Device:**
1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect phone via USB
4. Run: `flutter run`

---

## Detailed Setup

### 1. Flutter Installation

#### Verify Installation
```bash
flutter doctor -v
```

Should show:
- ✓ Flutter
- ✓ Android toolchain
- ✓ Android Studio
- ✓ Connected device

#### Fix Common Issues

**No Android SDK:**
```bash
flutter config --android-sdk /path/to/android/sdk
```

**No Android Licenses:**
```bash
flutter doctor --android-licenses
```

### 2. Android Emulator Setup

#### Create Emulator (Android Studio)
1. Open Android Studio
2. Tools → Device Manager
3. Create Device
4. Choose: Pixel 5 or Pixel 6
5. System Image: Android 11+ (API 30+)
6. Finish

#### Launch Emulator
```bash
flutter emulators
flutter emulators --launch Pixel_5_API_30
```

### 3. Physical Device Setup

#### Android Phone
1. **Enable Developer Options:**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect & Verify:**
```bash
flutter devices
```

Should show your device.

### 4. Network Configuration

#### For Emulator
- Use `10.0.2.2` to access host machine's `localhost`
- No additional setup needed

#### For Physical Device
1. **Connect to Same WiFi:**
   - Phone and computer must be on same network

2. **Find Computer IP:**
   - Windows: `ipconfig`
   - Mac: `ifconfig`
   - Linux: `ip addr`

3. **Update API Config:**
```dart
// lib/config/api_config.dart
static const String baseUrl = 'http://192.168.1.105:8000';
```

4. **Allow Firewall:**
   - Windows: Allow port 8000 in Windows Firewall
   - Mac: System Preferences → Security → Firewall → Allow
   - Linux: `sudo ufw allow 8000`

5. **Test Connection:**
   - Open phone browser
   - Visit: `http://YOUR_COMPUTER_IP:8000`
   - Should see API response

### 5. Running the App

#### Development Mode
```bash
flutter run
```

#### Hot Reload
- Press `r` in terminal for hot reload
- Press `R` for hot restart
- Press `q` to quit

#### Debug Mode
```bash
flutter run --debug
```

#### Release Mode
```bash
flutter run --release
```

### 6. Building APK

#### Debug APK
```bash
flutter build apk --debug
```

#### Release APK
```bash
flutter build apk --release
```

#### Split APKs (smaller size)
```bash
flutter build apk --split-per-abi
```

Output location:
```
build/app/outputs/flutter-apk/
├── app-armeabi-v7a-release.apk
├── app-arm64-v8a-release.apk
└── app-x86_64-release.apk
```

Install the appropriate one for your device.

---

## Testing

### 1. Test Backend Connection

**From Computer:**
```bash
curl http://localhost:8000
```

**From Phone Browser:**
```
http://YOUR_COMPUTER_IP:8000
```

Should return:
```json
{"message": "GST Billing System API", "version": "1.0.0"}
```

### 2. Test API Endpoints

**Customers:**
```bash
curl http://localhost:8000/customers
```

**Products:**
```bash
curl http://localhost:8000/products
```

**Sales:**
```bash
curl http://localhost:8000/sales
```

### 3. Test App Features

1. **Customer Search:**
   - Type in search field
   - Should show results
   - Tap to select
   - Details should auto-fill

2. **Product Search:**
   - Add item
   - Search product
   - Should show results
   - Tap to select
   - Price/HSN/GST should auto-fill

3. **Manual Entry:**
   - Add item
   - Tap "Enter manually"
   - Fill all fields
   - Amount should calculate

4. **Create Bill:**
   - Select customer
   - Add items
   - Tap "Create Bill"
   - Should show success message

5. **View History:**
   - Tap "History" tab
   - Should show bills
   - Tap bill to view details

---

## Troubleshooting

### Cannot Connect to Backend

**Problem:** App shows connection error

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:8000
   ```

2. Check API URL in `api_config.dart`

3. For physical device:
   - Verify same WiFi network
   - Test in phone browser first
   - Check firewall settings

4. Check backend logs for errors

### Search Not Working

**Problem:** No results when searching

**Solutions:**
1. Ensure backend has data:
   ```bash
   python backend/seed_sample_data.py
   ```

2. Check network connection

3. Search requires 2+ characters

### App Crashes

**Problem:** App crashes on startup

**Solutions:**
1. Clean and rebuild:
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

2. Check logs:
   ```bash
   flutter logs
   ```

3. Restart emulator/device

### Build Errors

**Problem:** Build fails

**Solutions:**
1. Update dependencies:
   ```bash
   flutter pub upgrade
   ```

2. Clean build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   flutter clean
   flutter pub get
   ```

3. Check Flutter version:
   ```bash
   flutter --version
   flutter upgrade
   ```

### Slow Performance

**Solutions:**
1. Use release mode:
   ```bash
   flutter run --release
   ```

2. Enable multidex (if needed):
   Edit `android/app/build.gradle`:
   ```gradle
   defaultConfig {
       multiDexEnabled true
   }
   ```

---

## Development Tips

### Hot Reload
- Save file → Auto hot reload
- Press `r` → Manual hot reload
- Press `R` → Hot restart

### Debugging
```bash
flutter run --debug
```

Then use:
- DevTools: `flutter pub global activate devtools`
- Chrome DevTools
- Android Studio debugger

### Logging
```dart
print('Debug message');
debugPrint('Debug message');
```

View logs:
```bash
flutter logs
```

### Code Generation
If you add models with JSON serialization:
```bash
flutter pub run build_runner build
```

---

## Production Checklist

- [ ] Update API URL to production backend
- [ ] Build release APK
- [ ] Test on multiple devices
- [ ] Test all features
- [ ] Check performance
- [ ] Sign APK (for Play Store)
- [ ] Create app icons
- [ ] Update version in `pubspec.yaml`

---

## Next Steps

1. **Run the app** using steps above
2. **Test all features** with sample data
3. **Build APK** for distribution
4. **Install on devices** for shop use

---

**Need Help?** Check the main README.md or Flutter documentation.
