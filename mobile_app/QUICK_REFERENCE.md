# Quick Reference Card

## 🚀 Run App (3 Commands)

```bash
cd mobile_app
flutter pub get
flutter run
```

---

## ⚙️ Configure API URL

**File:** `lib/config/api_config.dart`

**Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:8000';
```

**Physical Device:**
```dart
static const String baseUrl = 'http://192.168.1.XXX:8000';
```

---

## 📱 Create Bill (Fast Workflow)

1. **Search Customer** → Tap to select
2. **Search Product** → Tap to select
3. **Adjust Quantity** → Auto-calculates
4. **Add More Items** → Repeat steps 2-3
5. **Create Bill** → Done!

---

## 🔍 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `r` | Hot reload |
| `R` | Hot restart |
| `q` | Quit |
| `h` | Help |

---

## 🏗️ Build APK

**Debug:**
```bash
flutter build apk --debug
```

**Release:**
```bash
flutter build apk --release
```

**Output:** `build/app/outputs/flutter-apk/`

---

## 🐛 Quick Fixes

**Connection Error:**
```bash
# Check backend
curl http://localhost:8000

# For device, test in browser
http://YOUR_IP:8000
```

**Build Error:**
```bash
flutter clean
flutter pub get
flutter run
```

**App Crash:**
```bash
flutter logs
```

---

## 📊 Find Your IP

**Windows:**
```bash
ipconfig
```
Look for: IPv4 Address

**Mac:**
```bash
ifconfig en0 | grep inet
```

**Linux:**
```bash
ip addr show
```

---

## 🎯 Testing Checklist

- [ ] Backend running
- [ ] API URL correct
- [ ] Search customer works
- [ ] Search product works
- [ ] Create bill works
- [ ] View history works

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect | Check API URL, backend running |
| No search results | Add data: `python seed_sample_data.py` |
| Build fails | Run `flutter clean && flutter pub get` |
| Slow | Use `flutter run --release` |

---

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `lib/config/api_config.dart` | API URL |
| `lib/main.dart` | App entry |
| `pubspec.yaml` | Dependencies |
| `README.md` | Full docs |
| `SETUP_GUIDE.md` | Setup steps |

---

## 📦 Install APK

1. Build: `flutter build apk --release`
2. Copy APK to phone
3. Enable "Unknown Sources"
4. Tap APK to install

---

## ⚡ Performance Tips

- Use release mode for production
- Search with 2+ characters
- Pre-add frequent customers/products
- Keep backend on fast network

---

**Need Help?** See README.md or SETUP_GUIDE.md
