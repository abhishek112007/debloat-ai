# 🎨 Action Mode - Visual Guide

## UI Overview

```
┌─────────────────────────────────────────────────────────────┐
│  AI Assistant  [Samsung Galaxy]  [🔴 Actions OFF]  [Export] │  ← Header
│                                                        [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚡ Action Mode Active                        [Disable]    │  ← Status Banner
│  Commands like "Remove", "Scan" will be executed            │     (Shows when ON)
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│            ⚡ Android Debloating Assistant                  │
│                                                              │
│    Ask me anything about Android packages,                  │
│    debloating strategies, or device safety.                 │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │ 🔴 Action Mode: Disabled                       │        │  ← Mode Status
│  │                                                │        │     Card
│  │ I can only answer questions. Enable Action    │        │
│  │ Mode above to execute commands.               │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  [🔍 Scan bloatware] [⚡ Battery] [🛡️ Privacy] [🎯 Safe]  │  ← Quick Actions
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Try: 'Remove Facebook' or 'Scan bloatware'...    [🎤] [➤] │  ← Input
└─────────────────────────────────────────────────────────────┘     (Placeholder changes)
```

---

## State 1: Action Mode OFF (Default - Safe)

### Header Toggle Button
```
┌────────────────────┐
│ 🔴 Actions OFF     │  ← Gray/Red background
└────────────────────┘    Click to enable
```

### Status Banner
- **Hidden** - No banner shows

### Welcome Card
```
┌─────────────────────────────────────────┐
│ 🔴 Action Mode: Disabled                │
│                                         │
│ I can only answer questions. Enable    │
│ Action Mode above to execute commands.  │
└─────────────────────────────────────────┘
```

### Input Field
```
┌─────────────────────────────────────────────┐
│ Ask about Android packages...               │  ← Standard border
└─────────────────────────────────────────────┘
```

### When User Types Command
```
User: Remove Facebook
Bot:  I cannot execute actions when Action Mode is disabled.
      Would you like me to explain how to remove Facebook
      manually?
      
      To enable actions, click the "🔴 Actions OFF" button
      in the header.
```

---

## State 2: Enabling Action Mode

### Confirmation Dialog
```
┌─────────────────────────────────────────────┐
│  ⚠️ Enable Action Mode?                     │
│                                             │
│  This allows the chatbot to execute         │
│  commands like:                             │
│  • Remove packages                          │
│  • Scan device                              │
│  • Create backups                           │
│                                             │
│  All actions will require confirmation      │
│  before execution.                          │
│                                             │
│  Enable Action Mode?                        │
│                                             │
│         [Cancel]    [OK]                    │
└─────────────────────────────────────────────┘
```

### Success Message
```
Bot: 🟢 Action Mode Enabled

     I can now execute commands! Try:
     • "Scan for bloatware"
     • "Remove Facebook"
     • "Create backup"
     
     All actions require confirmation.
```

---

## State 3: Action Mode ON (Active)

### Header Toggle Button
```
┌────────────────────┐
│ 🟢 Actions ON      │  ← Green gradient background
└────────────────────┘    Pulsing glow effect
     ☝️ Click to disable
```

### Status Banner (VISIBLE)
```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Action Mode Active                      [Disable]    │
│ Commands like "Remove", "Scan", "Backup" will be executed│
└─────────────────────────────────────────────────────────┘
```

### Welcome Card
```
┌─────────────────────────────────────────┐
│ 🟢 Action Mode: Enabled                 │
│                                         │
│ I can execute commands like "Remove     │
│ Facebook", "Scan bloatware". All        │
│ require confirmation.                   │
└─────────────────────────────────────────┘
```

### Input Field
```
┌─────────────────────────────────────────────┐
│ Try: 'Remove Facebook' or 'Scan...         │  ← Green border
└─────────────────────────────────────────────┘
```

### When User Types Command
```
User: Remove Facebook

Bot:  ⚠️ Confirm Action
      
      Found 3 Facebook packages:
      • com.facebook.katana (Caution)
      • com.facebook.system (Caution)
      • com.facebook.services (Safe)
      
      ┌───────────────────────────────────┐
      │  [Cancel]         [Confirm] ✓     │
      └───────────────────────────────────┘
```

---

## Animation States

### Toggle Button Animations

**When OFF:**
```
🔴 Actions OFF
│
│ No special effects
│ Hover → slight scale increase
```

**When ON:**
```
🟢 Actions ON
│
├─ Pulsing glow (2s cycle)
├─ Emoji rotates on toggle (360°)
└─ Box shadow animation
```

### Status Banner Animations

**Appear:**
```
Height: 0 → auto
Opacity: 0 → 1
Slide down from header
```

**Lightning Emoji:**
```
⚡
│
└─ Scale pulse: 1 → 1.2 → 1 (2s repeat)
```

### Input Field Animations

**Focus + Action Mode ON:**
```
Border color: Standard → Green
Slight scale: 1 → 1.01
Glow effect appears
```

---

## Color Scheme

### Action Mode OFF (Safe State)
```
Button Background: var(--theme-bg-tertiary) or rgba(107, 114, 128, 0.1)
Button Text:       var(--theme-text-secondary)
Emoji:            🔴 (Red circle)
Border:           Standard theme border
```

### Action Mode ON (Active State)
```
Button Background: linear-gradient(135deg, #10b981 0%, #059669 100%)
Button Text:       white (#FFFFFF)
Emoji:            🟢 (Green circle)
Border:           rgba(16, 185, 129, 0.4)
Glow:             0 4px 12px rgba(16, 185, 129, 0.3)
```

### Status Banner Colors
```
Background:       linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))
Border Bottom:    2px solid rgba(16, 185, 129, 0.3)
Text:             var(--theme-text-primary)
Disable Button:   rgba(239, 68, 68, 0.2) background
                  #ef4444 text
```

---

## Responsive Behavior

### Desktop (>= 800px)
```
┌────────────────────────────────────────┐
│ Header: Full width, all buttons visible│
│ Toggle: Full text "Actions ON/OFF"    │
│ Banner: Full width with all text      │
└────────────────────────────────────────┘
```

### Tablet (480px - 800px)
```
┌─────────────────────────┐
│ Header: Compact layout  │
│ Toggle: Icon + short    │
│ Banner: Wrapped text    │
└─────────────────────────┘
```

### Mobile (< 480px)
```
┌──────────────────┐
│ Header: Minimal  │
│ Toggle: Icon only│
│ Banner: Stacked  │
└──────────────────┘
```

---

## Interaction Flow

### Complete User Journey

```
1. User opens chatbot
   ↓
2. Sees 🔴 Actions OFF button
   ↓
3. Reads welcome screen (explains mode)
   ↓
4. Asks question → Gets AI answer
   ↓
5. Wants to take action
   ↓
6. Clicks toggle button
   ↓
7. Sees warning dialog
   ↓
8. Clicks "OK"
   ↓
9. Button turns 🟢 Actions ON
   ↓
10. Status banner appears
    ↓
11. Input placeholder changes
    ↓
12. Types: "Remove Facebook"
    ↓
13. Sees confirmation dialog
    ↓
14. Clicks "Confirm"
    ↓
15. Action executes
    ↓
16. Sees success message
    ↓
17. Clicks "Disable" when done
    ↓
18. Returns to safe mode
```

---

## Keyboard Shortcuts (Future Enhancement)

### Suggested Shortcuts
```
Ctrl + Shift + A  → Toggle Action Mode
Ctrl + Enter      → Confirm pending action
Escape            → Cancel/Disable Action Mode
```

---

## Accessibility Features

### Screen Reader Announcements
```
When enabled:  "Action Mode enabled. Commands can now be executed."
When disabled: "Action Mode disabled. Chat only mode."
When action:   "Action requires confirmation. 3 packages found."
```

### ARIA Labels
```
Toggle Button:     aria-label="Toggle Action Mode. Currently: OFF"
Status Banner:     role="status" aria-live="polite"
Confirm Dialog:    role="alertdialog" aria-modal="true"
Disable Button:    aria-label="Disable Action Mode"
```

---

## Example Screens

### Screen 1: First Launch (Safe)
```
╔═══════════════════════════════════════════════════╗
║ AI Assistant          🔴 Actions OFF      [×]    ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║            ⚡ Android Debloating Assistant        ║
║                                                   ║
║  Ask me anything about Android packages,          ║
║  debloating strategies, or device safety.         ║
║                                                   ║
║  ┌──────────────────────────────────────────┐   ║
║  │ 🔴 Action Mode: Disabled                 │   ║
║  │                                          │   ║
║  │ I can only answer questions. Enable     │   ║
║  │ Action Mode above to execute commands.  │   ║
║  └──────────────────────────────────────────┘   ║
║                                                   ║
║  [🔍 Scan] [⚡ Battery] [🛡️ Privacy] [🎯 Safe]  ║
║                                                   ║
║  Ask about Android packages...          [🎤][➤] ║
╚═══════════════════════════════════════════════════╝
```

### Screen 2: Action Mode Active
```
╔═══════════════════════════════════════════════════╗
║ AI Assistant          🟢 Actions ON       [×]    ║
╠═══════════════════════════════════════════════════╣
║ ⚡ Action Mode Active              [Disable]     ║
║ Commands like "Remove", "Scan" will be executed  ║
╠═══════════════════════════════════════════════════╣
║ 🤖 Assistant                                      ║
║ 🟢 Action Mode Enabled                            ║
║                                                   ║
║ I can now execute commands! Try:                  ║
║ • "Scan for bloatware"                           ║
║ • "Remove Facebook"                              ║
║ • "Create backup"                                ║
║                                                   ║
║ All actions require confirmation.                 ║
║                                                   ║
║  Try: 'Remove Facebook' or...          [🎤][➤] ║
╚═══════════════════════════════════════════════════╝
```

### Screen 3: Action Confirmation
```
╔═══════════════════════════════════════════════════╗
║ AI Assistant          🟢 Actions ON       [×]    ║
╠═══════════════════════════════════════════════════╣
║ ⚡ Action Mode Active              [Disable]     ║
╠═══════════════════════════════════════════════════╣
║ 👤 You                                            ║
║ Remove Facebook                                   ║
║                                                   ║
║ 🤖 Assistant                                      ║
║ ┌───────────────────────────────────────────┐   ║
║ │ ⚠️ Confirm Action                         │   ║
║ │                                           │   ║
║ │ Found 3 Facebook packages:                │   ║
║ │ • com.facebook.katana (Caution)          │   ║
║ │ • com.facebook.system (Caution)          │   ║
║ │ • com.facebook.services (Safe)           │   ║
║ │                                           │   ║
║ │    [❌ Cancel]          [✅ Confirm]      │   ║
║ └───────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════╝
```

---

**This visual guide helps developers and users understand the complete Action Mode UI!** 🎨
