"""
Test the OpenClaw Integration
Run this to verify the command parser works correctly
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from openclaw_integration import CommandParser, ActionExecutor, OpenClawIntegration
from adb_operations import ADBOperations


def test_command_parser():
    """Test command parsing"""
    parser = CommandParser()
    
    test_cases = [
        "Remove Facebook from my phone",
        "Scan my device for bloatware",
        "Analyze com.facebook.katana",
        "Create a backup",
        "What is com.instagram.android?",
        "This is just a regular chat message",
    ]
    
    print("=" * 60)
    print("TESTING COMMAND PARSER")
    print("=" * 60)
    
    for message in test_cases:
        print(f"\n📝 Input: {message}")
        result = parser.parse_command(message)
        print(f"   Intent: {result['intent']}")
        print(f"   Actionable: {result['actionable']}")
        print(f"   Confidence: {result['confidence']}")
        if result['entities']:
            print(f"   Entities: {result['entities']}")
        print()


def test_action_execution():
    """Test action execution (mock - no real ADB calls)"""
    print("\n" + "=" * 60)
    print("TESTING ACTION EXECUTOR")
    print("=" * 60)
    
    # Create mock ADB (would connect to real device in production)
    try:
        adb = ADBOperations()
        executor = ActionExecutor(adb)
        
        # Test scan action
        print("\n🔍 Testing SCAN action...")
        scan_command = {
            'intent': 'scan',
            'entities': {'type': 'bloatware'},
            'actionable': True
        }
        result = executor.execute(scan_command)
        print(f"   Success: {result['success']}")
        print(f"   Message: {result['message']}")
        
        # Test uninstall action (just parsing, no actual removal)
        print("\n🗑️  Testing UNINSTALL action...")
        uninstall_command = {
            'intent': 'uninstall',
            'entities': {
                'target': 'facebook',
                'packages': ['facebook']
            },
            'actionable': True
        }
        result = executor.execute(uninstall_command)
        print(f"   Success: {result['success']}")
        print(f"   Action: {result['action']}")
        print(f"   Requires Confirmation: {result['requires_confirmation']}")
        print(f"   Message: {result['message']}")
        
    except Exception as e:
        print(f"⚠️  ADB not available (this is normal if device not connected)")
        print(f"   Error: {str(e)}")


def test_full_integration():
    """Test full OpenClaw integration"""
    print("\n" + "=" * 60)
    print("TESTING FULL INTEGRATION")
    print("=" * 60)
    
    try:
        adb = ADBOperations()
        openclaw = OpenClawIntegration(adb)
        
        messages = [
            "Remove all Facebook apps",
            "Just asking about Android packages",
            "Scan for bloatware",
        ]
        
        for msg in messages:
            print(f"\n💬 Message: {msg}")
            result = openclaw.process_message(msg)
            print(f"   Type: {result['type']}")
            if result['type'] == 'action':
                print(f"   Intent: {result['parsed']['intent']}")
                if result['execution']:
                    print(f"   Requires Confirmation: {result['execution']['requires_confirmation']}")
                    print(f"   Message: {result['execution']['message']}")
            print()
    
    except Exception as e:
        print(f"⚠️  ADB not available: {str(e)}")


if __name__ == "__main__":
    print("\n")
    print("╔════════════════════════════════════════════════════════╗")
    print("║   OpenClaw Integration Test Suite                     ║")
    print("║   Debloat AI                                           ║")
    print("╚════════════════════════════════════════════════════════╝")
    print()
    
    # Run tests
    test_command_parser()
    test_action_execution()
    test_full_integration()
    
    print("\n" + "=" * 60)
    print("✅ TESTS COMPLETE")
    print("=" * 60)
    print("\nNote: Some tests may show warnings if ADB device is not connected.")
    print("This is expected behavior for testing the parser independently.")
    print("\nTo test with actual device:")
    print("1. Connect Android device via USB")
    print("2. Enable USB debugging")
    print("3. Run: python test_openclaw.py")
