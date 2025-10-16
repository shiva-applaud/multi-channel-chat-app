# Environment Configuration Template

## 📋 Create `server/.env` File

Copy this content to a new file: `server/.env`

```bash
# ================================
# AI RESPONSE CONFIGURATION
# ================================
AI_RESPONSES_ENABLED=true
AI_RESPONSE_DELAY=1000
AI_PROVIDER=mock

# ================================
# TWILIO CONFIGURATION
# ================================
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15703251809

# ================================
# MONGODB CONFIGURATION
# ================================
MONGODB_URI=mongodb://localhost:27017/multi_channel_chat

# ================================
# SERVER CONFIGURATION
# ================================
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
SERVER_URL=http://localhost:3000

# ================================
# OPTIONAL: OpenAI Integration
# ================================
# OPENAI_API_KEY=sk-your-key-here
# OPENAI_MODEL=gpt-4

# ================================
# OPTIONAL: Anthropic Integration
# ================================
# ANTHROPIC_API_KEY=your-key-here

# ================================
# WEBHOOK URLS (for production)
# ================================
# SMS_WEBHOOK_URL=https://yourdomain.com/api/webhooks/sms
# VOICE_WEBHOOK_URL=https://yourdomain.com/api/webhooks/voice
# WHATSAPP_WEBHOOK_URL=https://yourdomain.com/api/webhooks/whatsapp
```

---

## 🚀 Quick Setup

### **PowerShell:**

```powershell
# Navigate to server directory
cd server

# Create .env file
New-Item -ItemType File -Name ".env"

# Open in notepad
notepad .env
```

### **Then paste the configuration above and:**

1. Replace `your_account_sid_here` with your Twilio Account SID
2. Replace `your_auth_token_here` with your Twilio Auth Token
3. Replace `+15703251809` with your actual Twilio number (or keep if that's yours)
4. Save and close

---

## 🔑 Required Settings

| Setting | Required | Description |
|---------|----------|-------------|
| `AI_RESPONSES_ENABLED` | ✅ | Set to `true` to enable AI auto-responses |
| `TWILIO_ACCOUNT_SID` | ✅ | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | ✅ | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | ✅ | Your Twilio phone number |
| `MONGODB_URI` | ✅ | MongoDB connection string |

---

## 🎨 Optional Settings

### **AI Provider Options:**

```bash
# Use mock AI (free, for testing)
AI_PROVIDER=mock

# Use OpenAI (requires API key)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4

# Use Anthropic Claude (requires API key)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here
```

### **AI Response Delay:**

```bash
# Time (in milliseconds) before AI responds
AI_RESPONSE_DELAY=1000    # 1 second (default)
AI_RESPONSE_DELAY=500     # 0.5 seconds (faster)
AI_RESPONSE_DELAY=2000    # 2 seconds (more realistic)
```

---

## ✅ Verification

After creating `.env`:

```powershell
# Restart server
npm run dev
```

**Check logs for:**
```
[info] AI responses enabled: true
[info] AI provider: mock
```

---

## 🔒 Security

**Important:**
- ✅ `.env` file is in `.gitignore` (never commit it!)
- ✅ Keep your Twilio credentials secret
- ✅ Never share your Auth Token
- ✅ Use environment variables in production

---

## 📚 Related Guides

- **[WEBHOOK_AI_RESPONSES_GUIDE.md](./WEBHOOK_AI_RESPONSES_GUIDE.md)** - Complete AI webhook documentation
- **[VERIFIED_CALLER_ID_GUIDE.md](./VERIFIED_CALLER_ID_GUIDE.md)** - Verified caller ID setup
- **[START_LOCALTUNNEL.md](./START_LOCALTUNNEL.md)** - Webhook public URL setup

---

**Ready to enable AI responses!** 🤖

