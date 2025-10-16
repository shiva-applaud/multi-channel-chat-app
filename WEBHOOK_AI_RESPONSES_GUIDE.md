# 🤖 AI Auto-Responses via Webhooks

## ✅ **What's Implemented**

Your webhooks now **automatically generate and send AI responses** when someone texts your Twilio number!

### **Complete Flow:**

```
Real Person texts Twilio number
          ↓
Twilio receives SMS/WhatsApp
          ↓
Twilio → Your webhook endpoint
          ↓
Your server:
  1. Stores incoming message in MongoDB
  2. Broadcasts to UI via Socket.IO
  3. Generates AI response (aiResponseService)
  4. Stores AI response in MongoDB
  5. Broadcasts AI response to UI
  6. Sends AI response back via TwiML
          ↓
Twilio sends AI reply to real person
          ↓
Real person receives AI response! 📱
```

---

## 🎯 **What Changed**

### **Before:**
```javascript
// Static response
<Response>
  <Message>Thanks for your message!</Message>
</Response>
```

### **After (AI-Powered):**
```javascript
// AI-generated dynamic response
const aiReply = await aiResponseService.generateResponse(messageBody, 'sms');

<Response>
  <Message>${aiReply}</Message>
</Response>
```

---

## 🔧 **Configuration**

### **Step 1: Enable AI Responses**

Create or update `server/.env`:

```bash
# AI Response Configuration
AI_RESPONSES_ENABLED=true
AI_RESPONSE_DELAY=1000
AI_PROVIDER=mock

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15703251809

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/multi_channel_chat

# Server Configuration
PORT=3000
NODE_ENV=development
```

### **Step 2: Restart Server**

```powershell
# Stop server (Ctrl+C)
# Restart
npm run dev
```

### **AI Response Settings:**

| Setting | Value | Description |
|---------|-------|-------------|
| `AI_RESPONSES_ENABLED` | `true` | Enable AI auto-responses |
| `AI_RESPONSE_DELAY` | `1000` (ms) | Simulated "thinking" time |
| `AI_PROVIDER` | `mock` | AI provider (mock/openai/anthropic) |

---

## 🧪 **Testing**

### **Test 1: SMS Webhook with AI**

**Prerequisites:**
1. ✅ Server running: `npm run dev`
2. ✅ Public URL (localtunnel): `lt --port 3000`
3. ✅ Webhook configured in Twilio Console
4. ✅ AI enabled in `.env`

**Steps:**

1. **From your phone, text your Twilio number:**
   ```
   TO: +15703251809
   Message: "Hello!"
   ```

2. **Server logs should show:**
   ```
   [info] Received SMS webhook: { From: '+1234567890', To: '+15703251809', Body: 'Hello!' }
   [info] SMS received from +1234567890 to +15703251809: Hello!
   [info] Incoming SMS message saved: 68ef67d33c2b4a54409a10cf
   [info] Message broadcast to channel: 68ef67d33c2b4a54409a10ce
   [info] Generating AI response for message: "Hello!"
   [info] AI response generated: "Hi there! 👋 How can I help you today?"
   [info] AI response saved: 68ef67d33c2b4a54409a10d0
   [info] AI response broadcast to UI
   ```

3. **On your phone, you receive:**
   ```
   FROM: +15703251809
   Message: "Hi there! 👋 How can I help you today?"
   ```

4. **In your app (http://localhost:8080):**
   - ✅ Incoming message appears
   - ✅ AI response appears
   - ✅ Both stored in MongoDB

**Success! 🎉**

---

### **Test 2: WhatsApp Webhook with AI**

**Prerequisites:**
1. ✅ WhatsApp Sandbox enabled in Twilio
2. ✅ Joined sandbox with your WhatsApp
3. ✅ Webhook configured for WhatsApp

**Steps:**

1. **From WhatsApp, message your Twilio sandbox number:**
   ```
   Message: "What services do you offer?"
   ```

2. **Server logs:**
   ```
   [info] Received WhatsApp webhook: { From: 'whatsapp:+1234567890', To: 'whatsapp:+15703251809', Body: 'What services do you offer?' }
   [info] Generating AI response for WhatsApp message: "What services do you offer?"
   [info] AI response generated: "We offer multi-channel communication..."
   [info] AI WhatsApp response saved: 68ef67d33c2b4a54409a10d1
   ```

3. **On WhatsApp, you receive AI response!**

---

## 🎨 **AI Response Types**

The mock AI generates contextual responses:

### **Greeting Messages:**
```
User: "Hello"
AI: "Hi there! 👋 How can I help you today?"

User: "Hey"
AI: "Hello! Nice to hear from you!"

User: "Good morning"
AI: "Good morning! 🌅 Hope you're having a great day!"
```

### **Help Requests:**
```
User: "help"
AI: "I'm here to help! You can ask me questions about our services..."

User: "support"
AI: "I'm happy to provide support. What do you need help with?"
```

### **Questions:**
```
User: "What are your hours?"
AI: "That's a great question! Let me help you with that..."

User: "Do you have pricing info?"
AI: "Good question! I'd be happy to share that information..."
```

### **Thanks:**
```
User: "Thank you"
AI: "You're welcome! 😊 Let me know if you need anything else!"

User: "Thanks!"
AI: "My pleasure! Happy to help anytime!"
```

### **Default:**
```
User: "Random text"
AI: "Thanks for your message! I've received your inquiry and will get back to you soon."
```

---

## 🔌 **API Integration (OpenAI/Anthropic)**

### **Option 1: OpenAI Integration**

**Update `.env`:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
```

**Update `server/services/aiResponseService.js`:**
```javascript
async generateOpenAIResponse(userMessage) {
  const { Configuration, OpenAIApi } = require('openai');
  
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for a business.' },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 150,
  });

  return completion.data.choices[0].message.content;
}
```

### **Option 2: Anthropic (Claude) Integration**

**Update `.env`:**
```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here
```

**Update `server/services/aiResponseService.js`:**
```javascript
async generateAnthropicResponse(userMessage) {
  const Anthropic = require('@anthropic-ai/sdk');
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 150,
    messages: [
      { role: 'user', content: userMessage }
    ],
  });

  return message.content[0].text;
}
```

---

## 📊 **Database Storage**

### **Incoming Message (from contact):**
```javascript
{
  _id: "68ef67d33c2b4a54409a10cf",
  channel_id: "68ef67d33c2b4a54409a10ce",
  session_id: "68ef67d33c2b4a54409a10cc",
  content: "Hello!",
  sender: "contact",  // External person
  type: "text",
  communication_type: "sms",
  status: "received",
  metadata: {
    twilioMessageSid: "SMa1b2c3d4e5f6...",
    fromNumber: "+1234567890",
    toNumber: "+15703251809"
  },
  createdAt: "2025-01-15T10:30:00.000Z"
}
```

### **AI Response (sent back):**
```javascript
{
  _id: "68ef67d33c2b4a54409a10d0",
  channel_id: "68ef67d33c2b4a54409a10ce",
  session_id: "68ef67d33c2b4a54409a10cc",
  content: "Hi there! 👋 How can I help you today?",
  sender: "contact",  // AI responds as contact
  type: "text",
  communication_type: "sms",
  status: "sent",
  metadata: {
    inResponseTo: "SMa1b2c3d4e5f6...",
    fromNumber: "+15703251809",
    toNumber: "+1234567890",
    generatedBy: "AI"
  },
  createdAt: "2025-01-15T10:30:02.000Z"
}
```

**Both messages:**
- ✅ Stored in MongoDB
- ✅ Linked to same session
- ✅ Broadcast to UI via Socket.IO
- ✅ Visible in chat interface

---

## 🔄 **Complete Conversation Flow**

### **Example Conversation:**

```
[10:30:00] Contact → Twilio: "Hello!"
[10:30:00] Webhook → Server: Store message
[10:30:00] Server → UI: Broadcast incoming message
[10:30:01] Server → AI: Generate response
[10:30:02] Server → DB: Store AI response
[10:30:02] Server → UI: Broadcast AI response
[10:30:02] Server → Twilio: Send TwiML with AI reply
[10:30:02] Twilio → Contact: "Hi there! 👋 How can I help you today?"

[10:31:00] Contact → Twilio: "What are your hours?"
[10:31:00] Webhook → Server: Store message
[10:31:01] Server → AI: Generate response
[10:31:02] Twilio → Contact: "That's a great question! Let me help you with that..."
```

**Result:**
- ✅ Natural conversation flow
- ✅ All messages stored
- ✅ Visible in UI in real-time
- ✅ Organized by session

---

## ⚙️ **Configuration Options**

### **Disable AI for Specific Channels**

Modify webhook to check channel settings:

```javascript
// Check if AI is enabled for this channel
const channel = await Channel.findOne({ phone_number: toNumber });
if (channel.ai_enabled === false) {
  // Don't generate AI response
  return res.send('<Response></Response>');
}
```

### **Custom AI Response per Communication Type**

```javascript
if (communicationType === 'sms') {
  // Short SMS-friendly responses
  aiReply = await generateShortResponse(messageBody);
} else if (communicationType === 'whatsapp') {
  // Longer WhatsApp responses with emojis
  aiReply = await generateRichResponse(messageBody);
}
```

### **Business Hours Check**

```javascript
const isBusinessHours = checkBusinessHours();
if (!isBusinessHours) {
  aiReply = "Thanks for your message! We're currently closed but will respond during business hours (9am-5pm EST).";
}
```

---

## 🚨 **Troubleshooting**

### **No AI Response Received**

**Check:**
1. ✅ `AI_RESPONSES_ENABLED=true` in `.env`
2. ✅ Server logs show "Generating AI response..."
3. ✅ No errors in webhook processing
4. ✅ TwiML response includes `<Message>${aiReply}</Message>`

**Server logs to look for:**
```
[info] Generating AI response for message: "..."
[info] AI response generated: "..."
[info] AI response saved: ...
```

### **Error: "AI response is null"**

**Cause:** AI service returned null (disabled or error)

**Fix:**
```bash
# In server/.env
AI_RESPONSES_ENABLED=true
```

### **Webhook receives message but no AI**

**Check webhook logs:**
```javascript
logger.info(`AI enabled: ${aiResponseService.isAIEnabled()}`);
```

**If false:**
1. Check `.env` file exists
2. Check `AI_RESPONSES_ENABLED=true`
3. Restart server

---

## 📈 **Performance Considerations**

### **Response Time:**

| AI Provider | Avg Response Time |
|-------------|-------------------|
| **Mock** | 1-2 seconds (configurable) |
| **OpenAI GPT-3.5** | 1-3 seconds |
| **OpenAI GPT-4** | 2-5 seconds |
| **Anthropic Claude** | 2-4 seconds |

**Twilio timeout:** 15 seconds

### **Cost Considerations:**

| Provider | Cost per Message |
|----------|------------------|
| **Mock** | Free |
| **OpenAI GPT-3.5** | ~$0.001 |
| **OpenAI GPT-4** | ~$0.01 |
| **Anthropic Claude** | ~$0.005 |

**Plus Twilio SMS:** ~$0.0075 per message

---

## 🎯 **Best Practices**

### **1. Fallback Responses**

Always have a fallback if AI fails:

```javascript
let aiReply = 'Thanks for your message!'; // Default

try {
  aiReply = await aiResponseService.generateResponse(messageBody, 'sms');
} catch (error) {
  logger.error('AI failed, using fallback');
  // aiReply already has fallback value
}
```

### **2. Response Validation**

Validate AI responses before sending:

```javascript
if (!aiReply || aiReply.length > 1600) {
  aiReply = 'Thanks for your message! We'll get back to you soon.';
}
```

### **3. Rate Limiting**

Prevent spam by rate limiting:

```javascript
const recentMessages = await Message.countDocuments({
  'metadata.fromNumber': fromNumber,
  createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
});

if (recentMessages > 5) {
  return res.send('<Response></Response>'); // No response
}
```

### **4. Message Context**

Include conversation history for better AI responses:

```javascript
const recentMessages = await Message.find({
  session_id: session._id
}).sort({ createdAt: -1 }).limit(5);

const context = recentMessages.map(m => m.content).join('\n');
const aiReply = await aiResponseService.generateResponseWithContext(messageBody, context);
```

---

## ✅ **Summary**

### **What Works Now:**

| Feature | Status | Description |
|---------|--------|-------------|
| **SMS Webhooks** | ✅ | Receive SMS, generate AI, reply |
| **WhatsApp Webhooks** | ✅ | Receive WhatsApp, generate AI, reply |
| **Database Storage** | ✅ | Store incoming + AI responses |
| **Socket.IO Broadcast** | ✅ | Real-time UI updates |
| **Mock AI** | ✅ | Contextual mock responses |
| **OpenAI Integration** | 🔧 | Ready to configure |
| **Anthropic Integration** | 🔧 | Ready to configure |

### **Message Flow:**

```
Real person texts → Webhook receives → Store in DB → 
Generate AI response → Store AI in DB → Send via TwiML → 
Real person receives AI reply 📱
```

### **Next Steps:**

1. ✅ **Enable AI:** Add `AI_RESPONSES_ENABLED=true` to `.env`
2. ✅ **Test:** Send SMS to your Twilio number
3. ✅ **Verify:** Check logs and receive AI response
4. 🔧 **Optional:** Integrate OpenAI/Anthropic for real AI

---

## 🚀 **Quick Start**

```powershell
# 1. Create .env file
cd server
New-Item -ItemType File -Name ".env"

# 2. Add configuration (edit in notepad)
notepad .env
# Add:
# AI_RESPONSES_ENABLED=true
# TWILIO_PHONE_NUMBER=+15703251809
# (add other Twilio credentials)

# 3. Restart server
npm run dev

# 4. Start localtunnel
lt --port 3000

# 5. Configure webhook in Twilio Console
# SMS Webhook: https://your-tunnel-url.loca.lt/api/webhooks/sms

# 6. Test by texting your Twilio number!
```

---

**Your webhooks now have AI-powered auto-responses!** 🤖🎉

**Test it and let me know what AI response you receive!** 📱

