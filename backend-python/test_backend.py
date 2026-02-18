"""
Test Script - Verify Python Backend Setup
Run this to test if everything is working
"""
import sys
import json
from adb_operations import ADBOperations, ADBError
from backup_manager import BackupManager

def test_adb():
    """Test ADB operations"""
    print("\n🔧 Testing ADB Operations...")
    
    try:
        adb = ADBOperations()
        
        # Test device detection
        print("  ├─ Getting device info...")
        device = adb.get_device_info()
        print(f"  ├─ ✅ Device: {device.get('model', 'Unknown')} ({device.get('serial', 'N/A')})")
        
        # Test package listing
        print("  ├─ Listing packages...")
        packages = adb.list_packages('all')
        print(f"  └─ ✅ Found {len(packages)} packages")
        
        return True
        
    except ADBError as e:
        print(f"  └─ ❌ ADB Error: {e}")
        return False
    except Exception as e:
        print(f"  └─ ❌ Error: {e}")
        return False


def test_backup():
    """Test backup manager"""
    print("\n💾 Testing Backup Manager...")
    
    try:
        backup = BackupManager()
        
        # Get backup path
        path = backup.get_backup_path()
        print(f"  ├─ Backup directory: {path}")
        
        # Test creating a backup
        print("  ├─ Creating test backup...")
        result = backup.create_backup(
            ['com.test.app1', 'com.test.app2'],
            {'model': 'Test Device'}
        )
        
        if result.get('success'):
            print(f"  ├─ ✅ Created: {result.get('backupName')}")
        else:
            print(f"  ├─ ❌ Failed: {result.get('message')}")
            return False
        
        # List backups
        print("  ├─ Listing backups...")
        backups = backup.list_backups()
        print(f"  └─ ✅ Found {len(backups)} backup(s)")
        
        return True
        
    except Exception as e:
        print(f"  └─ ❌ Error: {e}")
        return False


def test_ai():
    """Test AI advisor (requires API key)"""
    print("\n🤖 Testing AI Advisor...")
    
    try:
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        # Check if API key exists
        perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        openai_key = os.getenv('OPENAI_API_KEY')
        
        if not perplexity_key and not openai_key:
            print("  └─ ⚠️  No API key found in .env file")
            print("     Create .env and add PERPLEXITY_API_KEY or OPENAI_API_KEY")
            return False
        
        from ai_advisor import AIAdvisor
        
        # Determine which provider to use
        provider = 'perplexity' if perplexity_key else 'openai'
        print(f"  ├─ Using {provider.upper()} API")
        
        advisor = AIAdvisor(provider=provider)
        
        # Test package analysis
        print("  ├─ Analyzing test package...")
        result = advisor.analyze_package('com.android.vending')
        
        print(f"  ├─ ✅ Package: {result.get('packageName')}")
        print(f"  ├─ ✅ Risk: {result.get('riskCategory')}")
        print(f"  └─ ✅ Safe to remove: {result.get('safeToRemove')}")
        
        return True
        
    except Exception as e:
        print(f"  └─ ❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 PYTHON BACKEND TEST SUITE")
    print("=" * 60)
    
    results = {
        'ADB Operations': test_adb(),
        'Backup Manager': test_backup(),
        'AI Advisor': test_ai()
    }
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}  {test_name}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All tests passed! Backend is ready to use.")
        print("\n📝 Next steps:")
        print("  1. Run: npm install (install Electron)")
        print("  2. Run: npm run dev (start dev server)")
        print("  3. Test the full app!")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        print("\n💡 Common fixes:")
        print("  • ADB failed: Install Android SDK Platform Tools")
        print("  • AI failed: Create .env file with API key")
        print("  • Backup failed: Check file permissions")
    
    print("=" * 60)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
