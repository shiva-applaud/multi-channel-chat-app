# WhatsApp Integration Guide

## 📱 **Complete WhatsApp Setup and Testing**

This guide covers the full WhatsApp integration using Twilio's WhatsApp Business API, including sandbox setup, webhook configuration, and end-to-end testing.

---

## 🚀 **Quick Start**

### **1. Environment Setup**

Add to your `server/.env` file:

```env
# WhatsApp Configuration
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### **2. Test WhatsApp Integration**

```bash
# Test outbound WhatsApp message
curl -X POST http://localhost:3000/api/webhooks/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Hello from WhatsApp!"}'
```

---

## 🔧 **Twilio WhatsApp Sandbox Setup**

### **Step 1: Access WhatsApp Sandbox**

1. Go to [Twilio Console → Messaging → Try It Out → WhatsApp Sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox)
2. Note your sandbox number: `+1 415 523 8886`
3. Note your sandbox code (e.g., `join <your-code>`)

### **Step 2: Configure Webhook**

1. In the WhatsApp Sandbox settings, set:
   - **"When a message comes in"**: `https://<your-domain>/api/webhooks/whatsapp`
   - For local testing with ngrok: `https://abc123.ngrok.io/api/webhooks/whatsapp`

### **Step 3: Join the Sandbox**

1. Send a WhatsApp message to: `+1 415 523 8886`
2. Message content: `join <your-sandbox-code>`
3. You'll receive: "You are now connected to the sandbox!"

---

## 📤 **Outbound WhatsApp Messages**

### **Using the Test Endpoint**

```bash
curl -X POST http://localhost:3000/api/webhooks/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Hello from WhatsApp!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "data": {
    "sid": "SM1234567890abcdef",
    "to": "whatsapp:+1234567890",
    "from": "whatsapp:+14155238886",
    "status": "queued",
    "isMock": false,
    "dateCreated": "2024-01-01T12:00:00.000Z"
  }
}
```

### **Using the Messaging Service**

```javascript
const messagingService = require('./services/messaging/messagingService');

// Send WhatsApp message through a channel
const result = await messagingService.sendMessage(
  channelId,
  'Hello from WhatsApp!',
  'whatsapp',
  '+1234567890'
);
```

### **Using Twilio Service Directly**

```javascript
const twilioService = require('./services/twilioService');

// Send WhatsApp message directly
const result = await twilioService.sendWhatsApp(
  '+1234567890',
  'Hello from WhatsApp!'
);
```

---

## 📥 **Inbound WhatsApp Messages**

### **Webhook Processing**

When someone sends a WhatsApp message to your sandbox number, Twilio will POST to your webhook:

**POST Data:**
```
From: whatsapp:+1234567890
To: whatsapp:+14155238886
Body: Hello!
MessageSid: SM1234567890abcdef
NumMedia: 0
```

**Response (TwiML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks for your WhatsApp message!</Message>
</Response>
```

### **Session Management**

- **Session Continuity**: Messages from the same number within 5 minutes reuse the same session
- **New Sessions**: Messages after 5+ minutes create a new session
- **AI Responses**: Automatic AI responses are generated and sent back

---

## 🧪 **Testing Scenarios**

### **Test 1: Outbound Message**

```bash
# Send test WhatsApp message
curl -X POST http://localhost:3000/api/webhooks/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test message"}'
```

**Expected:**
- ✅ Message sent successfully
- ✅ SID returned
- ✅ Status: "queued"

### **Test 2: Inbound Message**

1. Send WhatsApp message to `+1 415 523 8886`
2. Check server logs for webhook processing
3. Verify AI response is sent back

**Expected:**
- ✅ Webhook received and processed
- ✅ Message stored in database
- ✅ Session created/updated
- ✅ AI response generated and sent

### **Test 3: Error Handling**

```bash
# Test with invalid phone number
curl -X POST http://localhost:3000/api/webhooks/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"to": "invalid", "message": "Test"}'
```

**Expected:**
- ❌ Error: "Invalid phone number format"

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. "Recipient must join the WhatsApp sandbox"**

**Problem:** Error 63016 - Message not delivered
**Solution:** 
- Recipient must send `join <sandbox-code>` to `+1 415 523 8886`
- Wait for confirmation message

#### **2. "Invalid phone number format"**

**Problem:** Error 21211 - Invalid phone number
**Solution:**
- Use international format: `+1234567890`
- Include country code
- No spaces or special characters

#### **3. "Invalid WhatsApp number"**

**Problem:** Error 63007 - Invalid WhatsApp number
**Solution:**
- Verify the number is a valid WhatsApp number
- Check if the number has WhatsApp installed

#### **4. Webhook not receiving messages**

**Problem:** No webhook calls received
**Solution:**
- Check webhook URL is accessible
- Verify ngrok is running (for local testing)
- Check Twilio console for webhook configuration

### **Debug Steps**

1. **Check Environment Variables:**
   ```bash
   echo $TWILIO_WHATSAPP_NUMBER
   # Should be: whatsapp:+14155238886
   ```

2. **Check Server Logs:**
   ```bash
   # View logs
   ./view-logs.ps1
   ```

3. **Test Webhook Endpoint:**
   ```bash
   curl -X GET http://localhost:3000/api/webhooks/health
   ```

4. **Verify Twilio Client:**
   - Check logs for "Twilio client initialized successfully"
   - Verify credentials in `.env` file

---

## 📋 **API Endpoints**

### **Test WhatsApp Message**

```http
POST /api/webhooks/test/whatsapp
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Hello from WhatsApp!"
}
```

### **Webhook Health Check**

```http
GET /api/webhooks/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Webhook endpoints are active",
  "endpoints": {
    "sms": "/api/webhooks/sms",
    "whatsapp": "/api/webhooks/whatsapp",
    "voice": "/api/webhooks/voice",
    "status": "/api/webhooks/status",
    "test_whatsapp": "/api/webhooks/test/whatsapp"
  }
}
```

---

## 🔒 **Security Considerations**

### **Webhook Validation**

```javascript
// Validate Twilio signature (production)
if (!validateTwilioSignature(req)) {
  return res.status(403).send('Forbidden');
}
```

### **Environment Variables**

- ✅ Store credentials in `.env` file
- ✅ Never commit `.env` to version control
- ✅ Use test credentials for development
- ✅ Use production credentials only in production

---

## 📚 **Additional Resources**

### **Twilio Documentation**

- [WhatsApp Business API](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [TwiML Voice](https://www.twilio.com/docs/voice/twiml)

### **Webhook Testing**

- [ngrok](https://ngrok.com/) - Local tunnel for webhook testing
- [Twilio CLI](https://www.twilio.com/docs/twilio-cli) - Command line interface

### **Error Codes**

- `21211` - Invalid phone number format
- `63016` - Message not delivered (sandbox issue)
- `63007` - Invalid WhatsApp number

---

## ✅ **Checklist**

Before going live, ensure:

- [ ] WhatsApp sandbox configured
- [ ] Webhook URL set in Twilio console
- [ ] Test number joined sandbox
- [ ] Environment variables configured
- [ ] Test outbound messages work
- [ ] Test inbound messages work
- [ ] AI responses working
- [ ] Error handling tested
- [ ] Logs show successful operations

---

## 🎉 **Ready for Production!**

Once all tests pass:

1. **Switch to Production WhatsApp Business Number**
2. **Update webhook URLs to production domain**
3. **Use production Twilio credentials**
4. **Test with real WhatsApp numbers**

Your WhatsApp integration is now complete and ready for production use! 🚀