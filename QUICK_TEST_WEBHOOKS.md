# Quick Test: Webhooks

## 🚀 **5-Minute Setup & Test**

### **Step 1: Start Everything**

```powershell
# Terminal 1: MongoDB
net start MongoDB

# Terminal 2: Backend
cd server
npm run dev

# Terminal 3: Frontend  
cd client
npm run serve

# Terminal 4: ngrok
ngrok http 3000
```

### **Step 2: Copy Your ngrok URL**

From Terminal 4, copy the HTTPS URL:
```
https://abc123.ngrok.io
```

### **Step 3: Configure Twilio**

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click your number: `+15703251809`
3. Set webhooks:
   - **SMS Webhook:** `https://abc123.ngrok.io/api/webhooks/sms`
   - **Voice Webhook:** `https://abc123.ngrok.io/api/webhooks/voice`
4. Click **Save**

5. For WhatsApp: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox
   - **WhatsApp Webhook:** `https://abc123.ngrok.io/api/webhooks/whatsapp`
   - Click **Save**

### **Step 4: Test!**

#### **Test 1: Send SMS**

From your phone, text: `+15703251809`

**Message:** "Testing webhooks!"

**Expected:**
- ✅ Message appears in app (SMS tab)
- ✅ Auto-reply received on your phone
- ✅ Backend logs show: "SMS received from..."

#### **Test 2: Send WhatsApp**

Open WhatsApp, message: `+15703251809`

**Message:** "Hello from WhatsApp!"

**Expected:**
- ✅ Message appears in app (WhatsApp tab)
- ✅ Auto-reply received in WhatsApp
- ✅ New session created automatically

#### **Test 3: Make Call**

Call: `+15703251809`

**Expected:**
- ✅ Call logged in app (Voice tab)
- ✅ You hear: "Thank you for calling..."
- ✅ Call info appears in messages

### **Step 5: Verify**

**Check Webhook Health:**
```powershell
curl https://abc123.ngrok.io/api/webhooks/health
```

**View Logs:**
```powershell
.\view-logs.ps1
```

**Twilio Debugger:**
https://console.twilio.com/us1/monitor/logs/debugger

---

## 🎯 **What Should Happen**

### **When You Send SMS:**

```
Your Phone → Twilio → Your Server → MongoDB → Socket.IO → Chat Interface
```

1. **Twilio receives SMS**
2. **Twilio POSTs to:** `https://abc123.ngrok.io/api/webhooks/sms`
3. **Server processes:**
   - Finds channel for `+15703251809`
   - Creates/finds SMS session
   - Stores message in MongoDB
   - Broadcasts via Socket.IO
4. **Frontend receives** Socket.IO event
5. **Message appears** in SMS tab
6. **Auto-reply sent** back to your phone

### **Expected Logs:**

```
[info] POST /api/webhooks/sms
[info] SMS received from +1234567890 to +15703251809: Testing webhooks!
[info] Created new SMS session: 507f1f77bcf86cd799439011
[info] Incoming SMS message saved: 507f1f77bcf86cd799439012
[info] Message broadcast to channel: 507f1f77bcf86cd799439010
```

### **Expected Frontend:**

- **Messages tab:** New message appears
- **Sender:** "contact" (shown on left side)
- **Content:** "Testing webhooks!"
- **Timestamp:** Current time
- **Session:** New session created automatically

---

## ❌ **Troubleshooting**

### **Problem: Message Not Appearing**

**Check:**
```powershell
# 1. Is ngrok running?
# Terminal 4 should show: "Forwarding https://..."

# 2. Is backend running?
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# 3. Is webhook configured correctly?
# Check Twilio Console - should show your ngrok URL

# 4. Check backend logs
.\view-logs.ps1
```

### **Problem: 403 Forbidden**

**Cause:** Signature validation enabled

**Fix:** Webhooks have validation commented out for development. If you need to enable it:

```javascript
// server/routes/webhooks.js
// Uncomment line ~30
if (!validateTwilioSignature(req)) {
  return res.status(403).send('Forbidden');
}
```

### **Problem: 404 Not Found**

**Check:**
```powershell
# Test webhook endpoint
curl http://localhost:3000/api/webhooks/health

# Should return:
# {
#   "status": "ok",
#   "message": "Webhook endpoints are active",
#   ...
# }
```

### **Problem: No Auto-Reply**

**Check Twilio Console:**
1. Go to: https://console.twilio.com/us1/monitor/logs/debugger
2. Click latest webhook request
3. Check response - should be TwiML with `<Message>` tag

---

## 📱 **Test Scenarios**

### **Scenario 1: Multiple Users**

```
User A texts: "Hello"
→ Creates Session A for User A

User B texts: "Hi there"
→ Creates Session B for User B

Both appear in app, in different sessions!
```

### **Scenario 2: Mixed Messages**

```
Send SMS: "Test 1"
Send WhatsApp: "Test 2"
Send another SMS: "Test 3"

Result:
- SMS tab shows: "Test 1", "Test 3"
- WhatsApp tab shows: "Test 2"
- Each in their own session
```

### **Scenario 3: Call + Message**

```
1. Call +15703251809
   → Call logged in Voice tab
   → Hear voice message
   → Call info stored

2. Then text +15703251809
   → Message in SMS tab
   → Auto-reply received
   → Separate session from call
```

---

## 🔍 **Debugging Tools**

### **1. Backend Logs**

```powershell
# Real-time logs
Get-Content server\logs\combined.log -Wait -Tail 20

# Search for webhook activity
Select-String -Path server\logs\combined.log -Pattern "webhook"
```

### **2. ngrok Inspector**

Open: http://127.0.0.1:4040

- See all HTTP requests to your server
- View request/response details
- Replay requests for testing

### **3. Twilio Debugger**

https://console.twilio.com/us1/monitor/logs/debugger

- See all webhook requests Twilio made
- View status codes (200, 403, 500)
- Check request/response bodies

### **4. MongoDB Inspection**

```javascript
// In MongoDB Compass or shell
use multi_channel_chat;

// View recent messages
db.messages.find().sort({createdAt: -1}).limit(10);

// View recent sessions
db.sessions.find().sort({createdAt: -1}).limit(10);
```

---

## ✅ **Success Indicators**

You'll know it's working when:

1. ✅ **SMS to Twilio number** appears in app's SMS tab
2. ✅ **Auto-reply received** on your phone
3. ✅ **Backend logs show** webhook activity
4. ✅ **Twilio debugger shows** 200 OK responses
5. ✅ **MongoDB has new** messages and sessions
6. ✅ **Frontend updates** in real-time without refresh

---

## 🎉 **You're Done!**

Your app now:
- ✅ Receives real SMS
- ✅ Receives real WhatsApp messages
- ✅ Receives real voice calls
- ✅ Stores everything in MongoDB
- ✅ Shows messages in real-time
- ✅ Auto-replies to incoming messages

**Next Steps:**
- Deploy to production server
- Enable signature validation
- Customize auto-replies
- Add more features!

---

**Need More Help?**

See full documentation:
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Complete webhook setup
- [TWILIO_INTEGRATION_GUIDE.md](./TWILIO_INTEGRATION_GUIDE.md) - Twilio details
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

