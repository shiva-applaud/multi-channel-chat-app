# Multi-Channel Chat Application

Full-stack Node.js + Vue 2 chat application with WhatsApp, SMS, and Phone Call support, powered by Twilio.

## Quick Start

1. Install dependencies:
```bash
npm run install-all
```

2. **Install and start MongoDB** (see [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions):
   - Local: `mongod` or `brew services start mongodb-community`
   - Cloud: Create free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

3. Create `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080

# MongoDB Configuration (use 127.0.0.1 for IPv4)
MONGODB_URI=mongodb://127.0.0.1:27017/multichannel-chat

# Twilio Configuration (optional - use mock mode without these)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# AI Response Configuration (optional)
AI_RESPONSES_ENABLED=true
AI_RESPONSE_DELAY=2000
AI_PROVIDER=mock
```

4. Start development servers:
```bash
npm run dev
```

5. Open http://localhost:8080 in your browser

## Twilio Integration

This app uses Twilio to generate real phone numbers. You can:

- **With Twilio**: Purchase real phone numbers from 15+ countries
- **Without Twilio**: Use mock mode for development/testing

📖 **See [TWILIO_SETUP.md](./TWILIO_SETUP.md) for detailed setup instructions**

## 🎉 Real Incoming Messages (Webhooks)

Your app now supports **production-ready webhooks** to receive real incoming messages!

When someone texts or calls your Twilio number, the message appears instantly in your chat interface:

- ✅ **Incoming SMS** - Receive real text messages
- ✅ **Incoming WhatsApp** - Receive WhatsApp messages
- ✅ **Incoming Voice Calls** - Receive call notifications
- ✅ **Real-time Updates** - Messages appear instantly via Socket.IO
- ✅ **Auto-Replies** - Automatically respond to incoming messages

### Quick Setup with ngrok:

```powershell
# 1. Install ngrok
choco install ngrok   # or download from ngrok.com

# 2. Start your app
npm run dev

# 3. Expose to internet
ngrok http 3000

# 4. Copy ngrok URL (e.g., https://abc123.ngrok.io)
# 5. Configure in Twilio Console:
#    SMS Webhook: https://abc123.ngrok.io/api/webhooks/sms
#    WhatsApp: https://abc123.ngrok.io/api/webhooks/whatsapp
#    Voice: https://abc123.ngrok.io/api/webhooks/voice
```

📖 **See [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) for complete setup guide**

## Project Structure

```
multi-channel-chat-app/
├── client/          # Vue 2 frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Node.js backend application
│   ├── routes/
│   ├── services/
│   ├── db/
│   ├── utils/
│   └── package.json
└── package.json     # Root package for orchestration
```

## Features

- 📱 **Twilio Integration**: Purchase real phone numbers from 15+ countries
- 💚 **WhatsApp Messaging**: Send and receive WhatsApp messages
- 💬 **SMS Messaging**: Text message support
- 📞 **Voice Calls**: Make and receive voice calls
- 🤖 **AI Auto-Responses**: Intelligent automated responses to user messages
- 📋 **Session Management**: Organize conversations into separate sessions
- ⚡ **Real-time Updates**: Powered by Socket.IO
- 🎨 **Beautiful Glass UI**: Modern glassmorphism design with sky blue theme
- 🎭 **Smooth Animations**: Professional transitions and effects
- 🎯 **Mock Mode**: Test without Twilio (perfect for development)
- 🗄️ **MongoDB Database**: Scalable NoSQL database with Mongoose ODM
- 📝 **Comprehensive Logging**: Winston-based logging system
- 💾 **Persistent Storage**: Both user and AI messages stored in MongoDB

## Tech Stack

**Backend:** Node.js, Express, Socket.IO, Twilio SDK, MongoDB, Mongoose, Winston  
**Frontend:** Vue 2, Vuex, Vue Router, Axios, Socket.IO Client  
**Design:** Glassmorphism UI, CSS Animations, Backdrop Filters

## Available Scripts

From the root directory:
- `npm run install-all` - Install dependencies for both client and server
- `npm run dev` - Run both client and server in development mode
- `npm start` - Run both in production mode
- `npm run build` - Build client for production
- `npm test` - Run server tests

From the client directory:
- `npm run serve` - Run Vue development server
- `npm run build` - Build for production
- `npm run lint` - Lint and fix files

From the server directory:
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests

## Documentation

- [Complete Twilio Flow](./COMPLETE_TWILIO_FLOW.md) - 🚀 **NEW! Complete Two-Way Twilio** - Full bidirectional SMS/WhatsApp
- [Webhook Setup Guide](./WEBHOOK_SETUP.md) - Production Webhooks - Receive real SMS/WhatsApp/Voice calls
- [Recipient Number Guide](./RECIPIENT_NUMBER_GUIDE.md) - How to send messages/calls to specific recipients
- [Twilio Integration Guide](./TWILIO_INTEGRATION_GUIDE.md) - Complete Twilio SMS/WhatsApp/Voice setup
- [Session Management Guide](./SESSIONS_GUIDE.md) - Complete session management documentation
- [Session Communication Types](./SESSION_TYPES.md) - How sessions are differentiated by type (WhatsApp/SMS/Voice)
- [AI Auto-Responses](./AI_RESPONSES.md) - Complete AI response system documentation
- [MongoDB Setup Guide](./MONGODB_SETUP.md) - How to install and configure MongoDB
- [Phone Number Flow](./PHONE_NUMBER_FLOW.md) - Complete flow diagram for number generation
- [Twilio Setup Guide](./TWILIO_SETUP.md) - How to configure Twilio for phone number generation
- [Server README](./server/README.md) - Backend API documentation
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues, solutions, and log viewing
- [Features](./FEATURES.md) - Detailed feature list

## Viewing Logs

View backend logs easily:
```powershell
# PowerShell (recommended)
.\view-logs.ps1              # View all logs
.\view-logs.ps1 error        # View errors only
.\view-logs.ps1 tail         # Follow logs in real-time

# Command Prompt
view-logs.bat                # View all logs
view-logs.bat error          # View errors only
```

Log files are located in: `server/logs/combined.log` and `server/logs/error.log`

## AI Auto-Responses

The app features intelligent AI responses that automatically reply to user messages!

### Enable AI Responses

Add to your `.env`:
```env
AI_RESPONSES_ENABLED=true        # Enable/disable AI responses
AI_RESPONSE_DELAY=2000           # Response delay in milliseconds (2 seconds)
AI_PROVIDER=mock                 # 'mock', 'openai', or 'anthropic'
```

### Features

- ✅ **Automatic Responses**: AI automatically replies to user messages
- ✅ **Database Storage**: Both user and AI messages stored in MongoDB
- ✅ **Real-time Delivery**: Responses delivered via Socket.IO
- ✅ **Context-Aware**: Responds based on message content (greetings, questions, etc.)
- ✅ **Configurable Delay**: Simulates natural response time
- ✅ **Toggle On/Off**: Enable or disable via API

### API Endpoints

```bash
# Get AI status
GET http://localhost:3000/api/ai/status

# Enable AI responses
POST http://localhost:3000/api/ai/enable

# Disable AI responses
POST http://localhost:3000/api/ai/disable

# Test AI response
POST http://localhost:3000/api/ai/test
Content-Type: application/json
{
  "message": "Hello!",
  "communication_type": "whatsapp"
}
```

### How It Works

1. **User sends a message** → Saved to MongoDB with `sender: 'user'`
2. **AI generates response** → Smart response based on message content
3. **AI message saved** → Stored in MongoDB with `sender: 'contact'`
4. **Real-time delivery** → Both messages sent via Socket.IO
5. **Frontend displays** → Conversation appears in chat interface

### Future Integrations

The AI service is ready to integrate with:
- **OpenAI GPT-4** - Set `AI_PROVIDER=openai` and add `OPENAI_API_KEY`
- **Anthropic Claude** - Set `AI_PROVIDER=anthropic` and add `ANTHROPIC_API_KEY`

## Supported Countries

Phone numbers can be generated for:
- 🇺🇸 USA, 🇨🇦 Canada, 🇬🇧 UK, 🇮🇳 India, 🇦🇺 Australia
- 🇩🇪 Germany, 🇫🇷 France, 🇯🇵 Japan, 🇧🇷 Brazil, 🇲🇽 Mexico
- 🇪🇸 Spain, 🇮🇹 Italy, 🇳🇱 Netherlands, and more...

## License

MIT

