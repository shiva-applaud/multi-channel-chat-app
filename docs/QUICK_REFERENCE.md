# 🚀 Quick Reference - AI Webhooks + Intelligent Sessions

## ✅ What's New

### **1. AI Auto-Responses via Webhooks** 🤖
- When someone texts your Twilio number, AI automatically responds
- Works for SMS, WhatsApp, and Voice
- Responses stored in database and shown in UI

### **2. Intelligent Session Management** 🔄
- Sessions created based on phone number + time gap
- Same person within 5 minutes → same session
- Same person after 5 minutes → new session
- Different people → always separate sessions

---

## 🎯 Session Logic

```
┌──────────────────────────────────────────┐
│ MESSAGE FROM: +1234567890                 │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ FIND SESSIONS FROM +1234567890            │
└──────────────────────────────────────────┘
           ↓
     ┌─────────┐
     │ Found?  │
     └─────────┘
        ↙   ↘
      YES    NO
       ↓      ↓
  ┌────────┐ ┌────────────┐
  │ Check  │ │ Create New │
  │  Time  │ │  Session   │
  └────────┘ └────────────┘
       ↓
  ┌────────┐
  │< 5 min?│
  └────────┘
     ↙   ↘
   YES    NO
    ↓      ↓
  ┌────┐ ┌────┐
  │Use │ │New │
  │Same│ │One │
  └────┘ └────┘
```

---

## 📊 Examples

### **Example 1: Continuous Chat**
```
10:00 - User: "Hello"           → Session #1 created
10:02 - AI:   "Hi there!"       → Session #1
10:03 - User: "What are hours?" → Session #1 (reused)
10:03 - AI:   "Great question!" → Session #1

Result: 1 session, 4 messages
```

### **Example 2: Time Gap**
```
10:00 - User: "Hello"      → Session #1 created
10:01 - AI:   "Hi there!"  → Session #1
(5 minutes pass)
10:07 - User: "Hi again"   → Session #2 created (time gap!)
10:07 - AI:   "Welcome!"   → Session #2

Result: 2 sessions, 2 messages each
```

### **Example 3: Multiple People**
```
10:00 - Person A: "Hello"     → Session #1 (Person A)
10:01 - Person B: "Hi"        → Session #2 (Person B)
10:02 - Person A: "Follow-up" → Session #1 (Person A)
10:03 - Person B: "Question"  → Session #2 (Person B)

Result: 2 sessions, one per person
```

---

## 🔧 Configuration

### **Environment Variables** (`server/.env`):

```bash
# REQUIRED
AI_RESPONSES_ENABLED=true
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+15703251809
MONGODB_URI=mongodb://localhost:27017/multi_channel_chat

# OPTIONAL
AI_RESPONSE_DELAY=1000
AI_PROVIDER=mock
```

### **Change Session Timeout:**

Edit `server/routes/webhooks.js` (3 places: SMS, WhatsApp, Voice):

```javascript
const FIVE_MINUTES = 5 * 60 * 1000;  // Default: 5 minutes

// Change to:
const FIVE_MINUTES = 2 * 60 * 1000;  // 2 minutes
const FIVE_MINUTES = 10 * 60 * 1000; // 10 minutes
const FIVE_MINUTES = 30 * 60 * 1000; // 30 minutes
```

---

## 🧪 Quick Test

### **Test Session Management:**

```bash
# 1. Start server
npm run dev

# 2. Start localtunnel
lt --port 3000

# 3. Configure Twilio webhook (once)
# https://console.twilio.com/
# Set webhook to: https://your-url.loca.lt/api/webhooks/sms

# 4. From your phone, text your Twilio number:
"Hello"

# 5. Wait 30 seconds, text again:
"Are you there?"

# 6. Wait 6 minutes, text again:
"Hi again"

# Result:
# - Messages 1-2: Same session (< 5 min gap)
# - Message 3: New session (> 5 min gap)
```

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `server/routes/webhooks.js` | Added AI + session logic |
| `server/models/Session.js` | Added `metadata` field |
| `server/routes/messages.js` | Added verified caller ID support |

---

## 📝 Server Logs

### **New Session:**
```
[info] SMS received from +1234567890 to +15703251809: Hello
[info] Created new SMS session: abc123 for +1234567890
[info] Generating AI response for message: "Hello"
[info] AI response generated: "Hi there! 👋..."
```

### **Reused Session:**
```
[info] SMS received from +1234567890 to +15703251809: Follow-up
[info] Reusing existing session abc123 (last message 120s ago)
[info] AI response generated: "Of course!..."
```

### **Time Gap:**
```
[info] SMS received from +1234567890 to +15703251809: Hi again
[info] Time gap of 360s detected. Creating new session.
[info] Created new SMS session: def456 for +1234567890
[info] AI response generated: "Welcome back!..."
```

---

## 💡 Key Concepts

### **Session Reuse Criteria:**

| Condition | Action |
|-----------|--------|
| Same number + < 5 min | ✅ Reuse session |
| Same number + > 5 min | ❌ New session |
| Different number | ❌ New session |
| No previous session | ❌ New session |

### **Metadata Stored:**

```javascript
session.metadata = {
  fromNumber: "+1234567890",     // Who sent the message
  firstMessageAt: "2025-01-15..." // When session started
}
```

---

## 🎯 Use Cases

| Scenario | Sessions Created |
|----------|------------------|
| **Customer texts 3 times in 2 minutes** | 1 session |
| **Customer texts, waits 10 min, texts again** | 2 sessions |
| **3 different customers text** | 3 sessions |
| **Customer texts daily for a week** | 7+ sessions (one per day) |

---

## 🔍 View in App

### **Sessions Page** (`/sessions`):

```
┌──────────────────────────────────────────┐
│ Sessions                                  │
├──────────────────────────────────────────┤
│ SMS from +1234567890                     │
│ 4 messages • 10:00 AM                    │
├──────────────────────────────────────────┤
│ SMS from +1234567890                     │
│ 2 messages • 10:07 AM                    │
├──────────────────────────────────────────┤
│ WhatsApp from +1987654321                │
│ 6 messages • 11:00 AM                    │
└──────────────────────────────────────────┘
```

Click any session → View all messages in that conversation

---

## 🚨 Troubleshooting

### **AI Not Responding:**

```bash
# Check .env
AI_RESPONSES_ENABLED=true  # Must be "true"

# Restart server
npm run dev
```

### **Sessions Not Reusing:**

```bash
# Check server logs for:
[info] Reusing existing session...

# If not appearing:
# 1. Time gap might be > 5 minutes
# 2. Different phone numbers
# 3. Session model missing metadata field
```

### **Webhooks Not Working:**

```bash
# 1. Check localtunnel running:
lt --port 3000

# 2. Check Twilio webhook configured:
# https://console.twilio.com/

# 3. Check server logs for:
[info] Received SMS webhook: ...
```

---

## 📚 Full Documentation

| Guide | Link |
|-------|------|
| Session Management | [SESSION_MANAGEMENT_GUIDE.md](./SESSION_MANAGEMENT_GUIDE.md) |
| AI Webhooks | [WEBHOOK_AI_RESPONSES_GUIDE.md](./WEBHOOK_AI_RESPONSES_GUIDE.md) |
| Verified Caller ID | [VERIFIED_CALLER_ID_GUIDE.md](./VERIFIED_CALLER_ID_GUIDE.md) |
| Complete Implementation | [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) |
| Environment Config | [ENV_CONFIG_TEMPLATE.md](./ENV_CONFIG_TEMPLATE.md) |

---

## ✅ Checklist

**Before Testing:**

- [ ] `.env` file created with correct values
- [ ] `AI_RESPONSES_ENABLED=true`
- [ ] Server restarted (`npm run dev`)
- [ ] Localtunnel running (`lt --port 3000`)
- [ ] Twilio webhook configured
- [ ] MongoDB running

**During Testing:**

- [ ] Text Twilio number from your phone
- [ ] Receive AI response SMS
- [ ] Check server logs for session creation
- [ ] View messages in app
- [ ] View sessions in Sessions page
- [ ] Text again within 5 minutes (same session)
- [ ] Wait 6 minutes, text again (new session)

---

## 🎉 Summary

**What works:**
- ✅ AI auto-responses via webhooks
- ✅ Intelligent session grouping
- ✅ Phone number tracking
- ✅ Time-based session creation
- ✅ Real-time UI updates
- ✅ Complete database storage

**How it works:**
```
Person texts → Webhook → Find/create session → 
Store message → Generate AI → Send response → 
Person receives AI SMS! 📱
```

**Time logic:**
```
< 5 min = Same session
> 5 min = New session
```

---

**Ready to test!** 🚀

**Text your Twilio number: `+15703251809`** 📱

