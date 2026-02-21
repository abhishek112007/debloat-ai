# ADB Setup Guide for Debloat AI

## Problem: Device connected but no packages showing

This happens when Windows detects your phone but ADB drivers aren't installed.

---

## ✅ Quick Setup (Xiaomi Phones)

### Step 1: Enable Developer Options
1. Open **Settings** → **About Phone**
2. Tap **MIUI Version** **7 times** rapidly
3. You'll see "You are now a developer!"

### Step 2: Enable USB Debugging
1. Go to **Settings** → **Additional Settings** → **Developer Options**
2. Turn ON:
   - **USB Debugging**
   - **Install via USB**
   - **USB debugging (Security settings)**

3. Scroll to **Default USB configuration**:
   - Select **File Transfer (MTP)**

### Step 3: Install ADB Drivers

**Windows users need to install Universal ADB Drivers:**

1. Download: [Universal ADB Driver](https://adb.clockworkmod.com/)
2. Run the installer: `UniversalAdbDriverSetup.msi`
3. Follow the installation wizard

**Alternative: Manual driver update**
1. Open **Device Manager** (Win + X → Device Manager)
2. Look for device with yellow exclamation mark
3. Right-click → **Update Driver** → **Search automatically**

### Step 4: Connect and Authorize
1. **Plug in your phone via USB**
2. On your phone, **pull down** notification shade
3. Tap the **USB notification**
4. Select **File Transfer (MTP)** or **Transfer Photos (PTP)**

5. A popup will appear on your phone:  
   **"Allow USB debugging?"**
   - Check: ✅ **Always allow from this computer**
   - Tap: **Allow**

### Step 5: Verify Connection
Open PowerShell or Terminal and run:
```powershell
adb devices
```

**Expected output:**
```
List of devices attached
V8R4Z1TIKFROM7AM    device
```

If you see **"unauthorized"**, go back to your phone and accept the USB debugging prompt.

If you see **nothing**, your USB drivers aren't installed correctly.

---

## 🔧 Troubleshooting

### Issue: `adb devices` shows empty list

**Solutions (try in order):**
1. **Change USB mode** on phone to MTP/PTP (not "Charging only")
2. **Try a different USB cable** (use the original cable)
3. **Try a different USB port** (prefer USB 2.0 ports on back of PC)
4. **Restart ADB:**
   ```powershell
   adb kill-server
   adb start-server
   adb devices
   ```
5. **Reinstall ADB drivers** (see Step 3 above) 6. **Reboot your phone** while keeping USB debugging enabled

### Issue: Device shows as "unauthorized"

**Solution:**
1. Unplug the phone
2. On phone: Settings → Developer Options → **Revoke USB debugging authorizations**
3. Plug in phone again
4. Accept the new authorization popup

### Issue: Windows doesn't detect phone at all

**Check:**
1. USB cable is good (try with another device)
2. USB port works (try another port)
3. Phone shows "Charging" when plugged in
4. Try enabling **PTP mode** instead of MTP

---

## 🚀 Once Connected

After ADB shows your device:
1. **Restart Debloat AI app**
2. Packages should load automatically
3. If not, click the **"Refresh Device Info"** button

---

## 📞 Still Having Issues?

Check if your computer can access the phone at all:
```powershell
# Check if Windows detects any USB device
Get-PnpDevice | Where-Object {$_.FriendlyName -like "*Android*" -or $_.FriendlyName -like "*ADB*"}
```

If you see devices with **Status: Unknown**, you definitely need to install ADB drivers.

---

**Need more help?** Search for "install ADB drivers [your phone model]" or visit XDA Developers forum.
