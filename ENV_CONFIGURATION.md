# Environment Variables Configuration

## 📝 **Your Twilio Credentials**

Based on your provided credentials, here's what your `server/.env` file should contain:

---

## 🔧 **Create `server/.env` File**

**Location:** `server/.env` (in the server directory)

**Contents:**

```env
# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=development
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:8080

# ============================================
# MongoDB Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/multi_channel_chat

# ============================================
# Twilio Configuration
# ============================================
TWILIO_ACCOUNT_SID=AC4feda09c353acfaeae1756f285d6cad0
TWILIO_USER_SID=USbd792e93f4d0373b305e5975ca4bc668
TWILIO_AUTH_TOKEN=7afe4cf18bf0b8c9708badd63fa58e68
TWILIO_PHONE_NUMBER=+15703251809

# Production Auth Token (for later use)
# TWILIO_PRODUCTION_AUTH_TOKEN=3b504efa3ed762607b296b2a468e0874

# ============================================
# Twilio Webhooks (for ngrok or production)
# ============================================
SMS_WEBHOOK_URL=
VOICE_WEBHOOK_URL=
WHATSAPP_WEBHOOK_URL=

# ============================================
# Mock Mode
# ============================================
# Set to false to use real Twilio API
MOCK_MODE=false

# ============================================
# AI Response Configuration
# ============================================
AI_RESPONSES_ENABLED=true
AI_RESPONSE_DELAY=2000
AI_PROVIDER=mock

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
```

---

## 📋 **Your Twilio Details**

| Setting | Value | Description |
|---------|-------|-------------|
| **Account SID** | `AC4feda09c353acfaeae1756f285d6cad0` | Your Twilio account identifier |
| **User SID** | `USbd792e93f4d0373b305e5975ca4bc668` | Your user identifier |
| **Test Auth Token** | `7afe4cf18bf0b8c9708badd63fa58e68` | Currently active (for testing) |
| **Production Auth Token** | `3b504efa3ed762607b296b2a468e0874` | Saved for later use |
| **Phone Number** | `+15703251809` | Your Twilio phone number |

---

## 🚀 **Quick Setup**

### **Step 1: Create the .env file**

```powershell
# In PowerShell, from your project root:
cd server
New-Item -Path ".env" -ItemType File
```

### **Step 2: Copy the configuration**

Open `server/.env` in your editor and paste the configuration above.

### **Step 3: Verify the file**

```powershell
# Check if file exists
Test-Path server\.env
# Should return: True

# View contents (optional)
Get-Content server\.env
```

### **Step 4: Restart your server**

```powershell
cd server
npm run dev
```

---

## 🔍 **How the Code Uses These Variables**

### **In `server/services/twilioService.js`:**

```javascript
constructor() {
  this.accountSid = process.env.TWILIO_ACCOUNT_SID;
  // Reads: AC4feda09c353acfaeae1756f285d6cad0
  
  this.authToken = process.env.TWILIO_AUTH_TOKEN;
  // Reads: 7afe4cf18bf0b8c9708badd63fa58e68
  
  if (this.accountSid && this.authToken) {
    const twilio = require('twilio');
    this.client = twilio(this.accountSid, this.authToken);
    // ✅ Twilio client initialized
  }
}
```

### **For Phone Number:**

```javascript
async purchasePhoneNumber(country) {
  // Returns your configured number
  if (this.client && process.env.TWILIO_PHONE_NUMBER) {
    return {
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      // Returns: +15703251809
    };
  }
}
```

### **For Sending Messages:**

```javascript
async sendSMS(to, message, from = null) {
  const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
  // Uses: +15703251809
  
  await this.client.messages.create({
    body: message,
    from: fromNumber,
    to: to
  });
}
```

---

## ⚙️ **Configuration Options**

### **MOCK_MODE**

```env
# Use real Twilio API (sends actual SMS/WhatsApp)
MOCK_MODE=false

# Use mock mode (simulates, no real messages sent)
# MOCK_MODE=true
```

**Current setting:** `false` (real Twilio API)

### **AI_RESPONSES_ENABLED**

```env
# Enable AI auto-responses
AI_RESPONSES_ENABLED=true

# Disable AI responses
# AI_RESPONSES_ENABLED=false
```

**Current setting:** `true` (AI will respond)

### **TWILIO_AUTH_TOKEN**

You have two tokens:

```env
# Currently using TEST token
TWILIO_AUTH_TOKEN=7afe4cf18bf0b8c9708badd63fa58e68

# To switch to production:
# TWILIO_AUTH_TOKEN=3b504efa3ed762607b296b2a468e0874
```

---

## 🧪 **Verify Configuration**

### **Test 1: Check Twilio Client Initialization**

Start your server and check logs:

```powershell
cd server
npm run dev
```

**Expected log:**
```
[info] Twilio client initialized successfully
```

**If you see this instead:**
```
[warn] Twilio credentials not configured
```
**→ Check your .env file exists and has correct values**

### **Test 2: Check Environment Variables**

Add this test to your server code temporarily:

```javascript
// In server/index.js, after require('dotenv').config();
console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('Twilio Phone:', process.env.TWILIO_PHONE_NUMBER);
console.log('Mock Mode:', process.env.MOCK_MODE);
```

**Expected output:**
```
Twilio Account SID: AC4feda09c353acfaeae1756f285d6cad0
Twilio Phone: +15703251809
Mock Mode: false
```

---

## 📁 **File Structure**

```
multi-channel-chat-app/
├── server/
│   ├── .env              ← Create this file (your credentials)
│   ├── .env.example      ← Template (for git/sharing)
│   ├── index.js          ← Loads .env via dotenv
│   ├── services/
│   │   └── twilioService.js  ← Uses TWILIO_* variables
│   └── ...
```

---

## 🔒 **Security Notes**

### **DO NOT commit .env to git!**

The `.env` file should already be in `.gitignore`:

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### **Keep credentials secure:**

- ✅ Store in `.env` file
- ✅ Never commit to version control
- ✅ Don't share in public channels
- ✅ Use test token for development
- ✅ Use production token only in production

---

## 🆘 **Troubleshooting**

### **Problem: Twilio not initialized**

**Symptoms:**
```
[warn] Twilio credentials not configured
```

**Solution:**
1. Check `.env` file exists: `Test-Path server\.env`
2. Check file contents: `Get-Content server\.env`
3. Verify no typos in variable names
4. Restart server: `npm run dev`

### **Problem: Mock mode active**

**Symptoms:**
```
[info] [MOCK] Sending SMS...
```

**Solution:**
```env
# In server/.env
MOCK_MODE=false  # Change to false
```

### **Problem: Messages not sending**

**Check:**
1. ✅ `.env` file exists
2. ✅ Credentials are correct
3. ✅ `MOCK_MODE=false`
4. ✅ Twilio account has credits
5. ✅ Phone number format: `+1234567890`

---

## ✅ **Checklist**

Before testing, ensure:

- [ ] `server/.env` file created
- [ ] Twilio Account SID: `AC4feda09c353acfaeae1756f285d6cad0`
- [ ] Twilio Auth Token: `7afe4cf18bf0b8c9708badd63fa58e68`
- [ ] Twilio Phone Number: `+15703251809`
- [ ] `MOCK_MODE=false`
- [ ] MongoDB URI: `mongodb://localhost:27017/multi_channel_chat`
- [ ] `AI_RESPONSES_ENABLED=true`
- [ ] Server restarted
- [ ] Logs show: "Twilio client initialized successfully"

---

## 🎉 **Ready to Test!**

Once your `.env` is configured:

1. **Start server:**
```powershell
cd server
npm run dev
```

2. **Check logs:**
```powershell
.\view-logs.ps1
```

3. **Send a message in the app**

4. **Check your phone for SMS!** 📱

---

**Need help creating the .env file? Let me know!**

