# Start localtunnel - Quick Guide

## ✅ **Your Setup Status**

- ✅ MongoDB: Running
- ✅ Server (Backend): Running on port 3000
- ✅ Client (Frontend): Running on http://localhost:8080/
- ✅ localtunnel: Installed
- ⏳ **Next: Start localtunnel tunnel**

---

## 🚀 **Start localtunnel NOW**

### **Open a new PowerShell terminal and run:**

```powershell
lt --port 3000
```

---

## 📊 **What You'll See**

```
your url is: https://seven-states-divide.loca.lt
```

**Example:**
```
your url is: https://seven-states-divide.loca.lt
```

---

## 📋 **Next Steps After Tunnel Starts**

### **1. Copy Your URL**

When localtunnel starts, you'll see something like:
```
your url is: https://seven-states-divide.loca.lt
```

**Copy this URL!** (yours will be different)

### **2. Test the Tunnel**

Open a browser and go to:
```
https://seven-states-divide.loca.lt/health
```

**Expected:** You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T..."
}
```

If you see a security page first, click "Continue" or "Click to Continue"

### **3. Configure Twilio Webhooks**

#### **For SMS:**

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
2. Click your number: `+15703251809`
3. Scroll to **"Messaging"** section
4. **A MESSAGE COMES IN:**
   - Webhook: `https://your-tunnel-url.loca.lt/api/webhooks/sms`
   - HTTP POST
5. **STATUS CALLBACK URL:**
   - Webhook: `https://your-tunnel-url.loca.lt/api/webhooks/status`
   - HTTP POST
6. Click **Save Configuration**

#### **For Voice:**

In the same page, scroll to **"Voice & Fax"** section:
- **A CALL COMES IN:**
  - Webhook: `https://your-tunnel-url.loca.lt/api/webhooks/voice`
  - HTTP POST

#### **For WhatsApp (Optional):**

1. Go to: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox
2. **WHEN A MESSAGE COMES IN:**
   - `https://your-tunnel-url.loca.lt/api/webhooks/whatsapp`
   - HTTP POST
3. Click **Save**

---

## 🧪 **Test the Setup**

### **Test 1: Send a Message FROM Your App**

1. Open: http://localhost:8080
2. Navigate to Chat
3. Enter your phone number: `+1234567890`
4. Type message: "Hello!"
5. Click Send

**Expected:**
- ✅ Message sent via Twilio
- ✅ Shows in UI
- ✅ Logs show: `📤 Sending SMS via Twilio...`

### **Test 2: Receive a Message TO Your App**

1. From your phone, text: `+15703251809`
2. Message: "Testing webhooks!"

**Expected:**
- ✅ Twilio receives SMS
- ✅ Sends webhook to your localtunnel URL
- ✅ Message appears in your app
- ✅ Auto-reply sent back to your phone
- ✅ Logs show: `SMS received from...`

---

## 📱 **Example URLs for Twilio**

If your tunnel URL is: `https://tough-lizard-92.loca.lt`

Then configure:
- **SMS Webhook:** `https://tough-lizard-92.loca.lt/api/webhooks/sms`
- **WhatsApp Webhook:** `https://tough-lizard-92.loca.lt/api/webhooks/whatsapp`
- **Voice Webhook:** `https://tough-lizard-92.loca.lt/api/webhooks/voice`
- **Status Callback:** `https://tough-lizard-92.loca.lt/api/webhooks/status`

---

## 🔍 **Troubleshooting**

### **Issue: "Connection refused" or "Can't reach tunnel"**

**Check:**
```powershell
# Is server running?
# You should see logs in server terminal

# Test locally first:
curl http://localhost:3000/health
```

### **Issue: "Click to Continue" page on first visit**

This is normal! localtunnel shows this for security.
- Click "Click to Continue"
- Then you'll see your app

### **Issue: Tunnel URL changes**

localtunnel URLs change each time you restart.
- If you restart localtunnel, get the new URL
- Update Twilio webhooks with new URL

### **Issue: Webhooks not working**

**Check logs:**
```powershell
# In project root
.\view-logs.ps1

# Look for webhook activity:
# [info] POST /api/webhooks/sms
# [info] SMS received from...
```

**Check Twilio Debugger:**
https://console.twilio.com/us1/monitor/logs/debugger

---

## ⚠️ **Important Notes**

1. **Keep localtunnel running** - Don't close the terminal
2. **URL changes on restart** - Each time you restart localtunnel, update Twilio
3. **For production** - Deploy to cloud hosting (Render, Heroku, etc.)
4. **Free tier limits** - localtunnel is free but may have rate limits

---

## 🎯 **Quick Command Reference**

```powershell
# Start localtunnel
lt --port 3000

# Check if server is running
curl http://localhost:3000/health

# View backend logs
.\view-logs.ps1

# Stop localtunnel
# Press Ctrl+C in localtunnel terminal
```

---

## ✅ **Success Checklist**

After setup, you should have:

- [ ] localtunnel running in Terminal 3
- [ ] Public URL received (https://something.loca.lt)
- [ ] Twilio webhooks configured with tunnel URL
- [ ] Test message sent FROM app works
- [ ] Test message received TO app works
- [ ] Auto-reply received on your phone
- [ ] Logs show webhook activity

---

## 📚 **Full Documentation**

- [WEBHOOK_PUBLIC_URL_GUIDE.md](./WEBHOOK_PUBLIC_URL_GUIDE.md) - Complete webhook guide
- [COMPLETE_TWILIO_FLOW.md](./COMPLETE_TWILIO_FLOW.md) - How everything works
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Detailed webhook setup

---

## 🎉 **You're Almost There!**

**Current Status:**
1. ✅ Server running (Terminal 1)
2. ✅ Client running (Terminal 2)
3. ⏳ **RUN THIS NOW:** `lt --port 3000` (Terminal 3)

**Then:**
4. Copy tunnel URL
5. Configure Twilio webhooks
6. Test by texting your Twilio number!

---

**Open a new terminal and run:**

```powershell
lt --port 3000
```

**Then tell me the URL you get!** 🚀

