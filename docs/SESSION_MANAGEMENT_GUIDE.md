# 🔄 Intelligent Session Management Guide

## ✅ What's Implemented

Your webhooks now use **intelligent session management** based on phone number and time gaps!

### **Session Logic:**

```
Same phone number texts within 5 minutes → Reuse existing session
Same phone number texts after 5+ minutes → Create new session
Different phone number texts → Always create new session
```

---

## 🎯 How It Works

### **Scenario 1: Continuous Conversation (Within 5 Minutes)**

```
10:00:00 - Person texts: "Hello"
         → Creates Session #1
         → Saves message in Session #1

10:02:00 - Same person texts: "What are your hours?"
         → Finds Session #1 (last message 2 min ago)
         → Reuses Session #1
         → Saves message in Session #1

10:04:30 - Same person texts: "Thank you"
         → Finds Session #1 (last message 2.5 min ago)
         → Reuses Session #1
         → Saves message in Session #1

Result: All 3 messages in Session #1 ✅
```

### **Scenario 2: New Conversation (After 5 Minutes)**

```
10:00:00 - Person texts: "Hello"
         → Creates Session #1
         → Saves message in Session #1

10:10:00 - Same person texts: "Hi again"
         → Finds Session #1 (last message 10 min ago)
         → Time gap > 5 minutes!
         → Creates Session #2
         → Saves message in Session #2

Result: Message 1 in Session #1, Message 2 in Session #2 ✅
```

### **Scenario 3: Multiple People Texting**

```
10:00:00 - Person A (+1234567890) texts: "Hello"
         → Creates Session #1 for +1234567890

10:01:00 - Person B (+1987654321) texts: "Hi there"
         → Creates Session #2 for +1987654321

10:02:00 - Person A texts: "Are you there?"
         → Finds Session #1 (last message 2 min ago)
         → Reuses Session #1

10:03:00 - Person B texts: "Can you help?"
         → Finds Session #2 (last message 2 min ago)
         → Reuses Session #2

Result:
- Person A: 2 messages in Session #1 ✅
- Person B: 2 messages in Session #2 ✅
```

---

## 🔧 Implementation Details

### **Files Modified:**

1. **`server/routes/webhooks.js`**
   - SMS webhook session logic (lines 83-123)
   - WhatsApp webhook session logic (lines 280-320)
   - Voice webhook session logic (lines 456-496)

2. **`server/models/Session.js`**
   - Added `metadata` field to store phone numbers
   - Added index for `metadata.fromNumber` for performance

### **Session Creation Logic:**

```javascript
const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
const now = new Date();

// Find most recent session from this phone number
let session = await Session.findOne({
  channel_id: channel._id.toString(),
  communication_type: 'sms',
  'metadata.fromNumber': fromNumber,
  status: 'active'
}).sort({ last_message_at: -1 });

// Check time gap
if (session && session.last_message_at) {
  const timeSinceLastMessage = now - new Date(session.last_message_at);
  
  if (timeSinceLastMessage > FIVE_MINUTES) {
    // Create new session
    session = null;
  } else {
    // Reuse existing session
    logger.info(`Reusing session (last message ${Math.round(timeSinceLastMessage / 1000)}s ago)`);
  }
}

// Create new session if needed
if (!session) {
  session = new Session({
    // ... session fields
    metadata: {
      fromNumber: fromNumber,
      firstMessageAt: now
    }
  });
  await session.save();
}
```

---

## 📊 Database Structure

### **Session Document:**

```json
{
  "_id": "68ef67d33c2b4a54409a10cc",
  "channel_id": "68ef67d33c2b4a54409a10ce",
  "communication_type": "sms",
  "title": "SMS from +1234567890",
  "status": "active",
  "message_count": 3,
  "last_message_at": "2025-01-15T10:04:30.000Z",
  "metadata": {
    "fromNumber": "+1234567890",
    "firstMessageAt": "2025-01-15T10:00:00.000Z"
  },
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:04:30.000Z"
}
```

### **Message Documents (in same session):**

```json
[
  {
    "_id": "msg1",
    "session_id": "68ef67d33c2b4a54409a10cc",
    "content": "Hello",
    "sender": "contact",
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  {
    "_id": "msg2",
    "session_id": "68ef67d33c2b4a54409a10cc",
    "content": "What are your hours?",
    "sender": "contact",
    "createdAt": "2025-01-15T10:02:00.000Z"
  },
  {
    "_id": "msg3",
    "session_id": "68ef67d33c2b4a54409a10cc",
    "content": "Thank you",
    "sender": "contact",
    "createdAt": "2025-01-15T10:04:30.000Z"
  }
]
```

---

## 🧪 Testing

### **Test 1: Messages Within 5 Minutes (Same Session)**

**From your phone, text your Twilio number:**

```
10:00:00 - Send: "Hello"
10:01:00 - Send: "Are you there?"
10:02:30 - Send: "Can you help?"
```

**Expected Server Logs:**

```
[info] SMS received from +1234567890 to +15703251809: Hello
[info] Created new SMS session: 68ef67d33c2b4a54409a10cc for +1234567890

[info] SMS received from +1234567890 to +15703251809: Are you there?
[info] Reusing existing session 68ef67d33c2b4a54409a10cc (last message 60s ago)

[info] SMS received from +1234567890 to +15703251809: Can you help?
[info] Reusing existing session 68ef67d33c2b4a54409a10cc (last message 90s ago)
```

**In your app (Sessions page):**
- ✅ Shows 1 session
- ✅ Session title: "SMS from +1234567890"
- ✅ Message count: 6 (3 from you + 3 AI responses)

**Click the session:**
- ✅ Shows all 6 messages in order

---

### **Test 2: Messages After 5 Minutes (New Session)**

**From your phone:**

```
10:00:00 - Send: "Hello"
         → Wait 6 minutes
10:06:00 - Send: "Hi again"
```

**Expected Server Logs:**

```
[info] SMS received from +1234567890 to +15703251809: Hello
[info] Created new SMS session: session-1 for +1234567890

[info] SMS received from +1234567890 to +15703251809: Hi again
[info] Time gap of 360s detected. Creating new session.
[info] Created new SMS session: session-2 for +1234567890
```

**In your app (Sessions page):**
- ✅ Shows 2 sessions
- ✅ Session 1: 2 messages (1 from you + 1 AI)
- ✅ Session 2: 2 messages (1 from you + 1 AI)

---

### **Test 3: Multiple Phone Numbers (Separate Sessions)**

**From Phone A (+1234567890):**
```
10:00:00 - Send: "Hello"
```

**From Phone B (+1987654321):**
```
10:01:00 - Send: "Hi there"
```

**Expected:**
- ✅ 2 separate sessions created
- ✅ Session 1 for +1234567890
- ✅ Session 2 for +1987654321

**Server Logs:**

```
[info] Created new SMS session: session-1 for +1234567890
[info] Created new SMS session: session-2 for +1987654321
```

---

## ⚙️ Configuration

### **Change Time Threshold:**

To change from 5 minutes to a different value, edit `server/routes/webhooks.js`:

```javascript
// Change this constant in all 3 webhook handlers (SMS, WhatsApp, Voice)
const FIVE_MINUTES = 10 * 60 * 1000; // 10 minutes
const FIVE_MINUTES = 2 * 60 * 1000;  // 2 minutes
const FIVE_MINUTES = 60 * 1000;      // 1 minute
```

**Recommended Values:**

| Use Case | Time Gap | Reasoning |
|----------|----------|-----------|
| **Customer Support** | 5-10 minutes | Allows follow-up questions |
| **Sales/Marketing** | 30-60 minutes | Longer conversations |
| **Notifications** | 1-2 minutes | Quick acknowledgments only |
| **Chatbot** | 15 minutes | Extended AI conversations |

---

## 📈 Benefits

### **1. Better Conversation Organization**

**Before (No Session Management):**
```
All messages → Single session → Hard to track conversations
```

**After (Smart Session Management):**
```
Conversation 1 (10:00-10:04) → Session 1
Conversation 2 (10:15-10:20) → Session 2
Conversation 3 (10:45-10:50) → Session 3
```

### **2. Multiple Contacts Support**

Each person gets their own sessions automatically:

```
Person A → Sessions 1, 3, 5
Person B → Sessions 2, 4
Person C → Session 6
```

### **3. Clean Session History**

```
Sessions Page:
- "SMS from +1234567890" (5 messages, 10:00 AM)
- "SMS from +1234567890" (3 messages, 10:20 AM)
- "WhatsApp from +1987654321" (10 messages, 11:00 AM)
```

### **4. Better AI Context**

AI can:
- Access recent messages from same session
- Understand conversation flow
- Provide contextual responses

---

## 🔍 Session Tracking

### **View Sessions in Your App:**

1. **Go to:** http://localhost:8080
2. **Click:** Sessions (icon in header)
3. **See all sessions:**
   - Session title (shows phone number)
   - Message count
   - Last message time
   - Communication type (SMS/WhatsApp/Voice)

### **Filter by Communication Type:**

```
Sessions Page:
- Tab: All (shows all sessions)
- Tab: WhatsApp (shows only WhatsApp sessions)
- Tab: SMS (shows only SMS sessions)
- Tab: Voice (shows only Voice sessions)
```

### **View Session Messages:**

Click any session → Navigate to Chat → Shows only messages from that session

---

## 📝 Server Logs

### **New Session Created:**

```
[info] SMS received from +1234567890 to +15703251809: Hello
[info] Created new SMS session: 68ef67d33c2b4a54409a10cc for +1234567890
```

### **Session Reused:**

```
[info] SMS received from +1234567890 to +15703251809: Follow-up question
[info] Reusing existing session 68ef67d33c2b4a54409a10cc (last message 120s ago)
```

### **Time Gap Detected:**

```
[info] SMS received from +1234567890 to +15703251809: Hi again
[info] Time gap of 400s detected. Creating new session.
[info] Created new SMS session: 68ef67d33c2b4a54409a10cd for +1234567890
```

---

## 🎯 Use Cases

### **1. Customer Support:**

```
Customer texts: "I have a question about my order"
→ Session 1 created

5 minutes of back-and-forth conversation
→ All in Session 1

Issue resolved, customer leaves

Next day, customer texts: "Another question"
→ Session 2 created (new topic, new session)
```

### **2. Sales Inquiry:**

```
Lead texts: "Tell me about your product"
→ Session 1 created

20 minutes of conversation about features
→ All in Session 1

Lead thinks about it, texts back 30 min later
→ Session 2 created (shows renewed interest)
```

### **3. Multi-Customer Service:**

```
10:00 - Customer A texts: "Help with order #123"
      → Session 1 for Customer A

10:05 - Customer B texts: "Shipping question"
      → Session 2 for Customer B

10:10 - Customer A texts again: "Follow-up on #123"
      → Adds to Session 1 (within 5 minutes)

10:15 - Customer B texts again: "Thanks"
      → Adds to Session 2 (within 5 minutes)
```

**Result:** Organized, separate conversations! ✅

---

## 🚨 Troubleshooting

### **Sessions Not Being Reused:**

**Check:**
1. ✅ Time gap is actually < 5 minutes
2. ✅ Same phone number (check logs)
3. ✅ Session model has `metadata` field
4. ✅ Server restarted after changes

**Debug:**
```javascript
// Add this to webhook code temporarily
logger.info(`Time since last message: ${Math.round(timeSinceLastMessage / 1000)}s`);
logger.info(`Five minutes threshold: ${FIVE_MINUTES / 1000}s`);
```

### **Too Many Sessions Created:**

**Issue:** Time threshold too low

**Fix:** Increase from 5 to 10 minutes:
```javascript
const FIVE_MINUTES = 10 * 60 * 1000;
```

### **Sessions Not Separated:**

**Issue:** Time threshold too high

**Fix:** Decrease from 5 to 2 minutes:
```javascript
const FIVE_MINUTES = 2 * 60 * 1000;
```

---

## 🔄 Session Lifecycle

```
┌─────────────────────────────────────────┐
│ 1. FIRST MESSAGE FROM PHONE NUMBER      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. CREATE NEW SESSION                    │
│    - Store fromNumber in metadata       │
│    - Set status: active                 │
│    - Set last_message_at: now           │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. MORE MESSAGES (< 5 MIN)               │
│    - Find session by fromNumber         │
│    - Check time gap                     │
│    - Reuse existing session             │
│    - Update last_message_at             │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. TIME GAP > 5 MINUTES                  │
│    - Create new session                 │
│    - Link to same phone number          │
│    - Start fresh conversation           │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 5. VIEW IN APP                           │
│    - See all sessions by phone number   │
│    - Each session = distinct convo      │
│    - Click to view messages             │
└─────────────────────────────────────────┘
```

---

## ✅ Summary

### **What's Implemented:**

| Feature | Status | Description |
|---------|--------|-------------|
| **Time-based Session** | ✅ | New session after 5 min gap |
| **Phone Number Tracking** | ✅ | Sessions linked to sender |
| **Multiple Contacts** | ✅ | Each person has own sessions |
| **SMS Support** | ✅ | Works for SMS webhooks |
| **WhatsApp Support** | ✅ | Works for WhatsApp webhooks |
| **Voice Support** | ✅ | Works for Voice webhooks |
| **Database Metadata** | ✅ | Stores phone numbers |
| **Performance Index** | ✅ | Optimized queries |

### **Session Management Logic:**

```
Same number + < 5 min → Reuse session ✅
Same number + > 5 min → New session ✅
Different number → Always new session ✅
```

### **Benefits:**

- ✅ Organized conversations
- ✅ Multiple customer support
- ✅ Better AI context
- ✅ Clean session history
- ✅ Automatic management (no manual work)

---

## 🚀 Quick Start

**Already implemented! No configuration needed.**

Just text your Twilio number and:

1. **First text:** New session created
2. **Reply within 5 min:** Same session used
3. **Reply after 5 min:** New session created
4. **View in app:** Go to Sessions page

---

**Your webhooks now intelligently manage sessions based on phone number and time!** 🎉

**Test it:** Text your Twilio number, wait 6 minutes, text again, and see 2 separate sessions! 📱

