# AI Auto-Response System

Complete documentation for the intelligent AI auto-response feature.

## Overview

The Multi-Channel Chat App includes an intelligent AI response system that automatically generates and sends replies to user messages. Both user messages and AI responses are **automatically stored in MongoDB**, ensuring complete conversation history.

## 🎯 Key Features

- ✅ **Automatic Responses**: AI responds to user messages instantly
- ✅ **Database Persistence**: All messages (user and AI) saved to MongoDB
- ✅ **Real-time Delivery**: Messages sent via Socket.IO
- ✅ **Context-Aware**: Smart responses based on message content
- ✅ **Configurable Delay**: Customizable response timing
- ✅ **Multiple Providers**: Support for mock, OpenAI, and Anthropic
- ✅ **Easy Toggle**: Enable/disable via API or environment variables

## 📋 How It Works

### Complete Flow

```
1. User sends message
   ↓
2. User message saved to MongoDB (sender: 'user')
   ↓
3. User message broadcasted via Socket.IO
   ↓
4. AI service generates response
   ↓
5. AI response saved to MongoDB (sender: 'contact')
   ↓
6. AI response broadcasted via Socket.IO
   ↓
7. Frontend displays both messages in chat
```

### Database Storage

**User Message:**
```javascript
{
  _id: ObjectId("..."),
  channel_id: "507f1f77bcf86cd799439011",
  content: "Hello, how are you?",
  sender: "user",
  type: "text",
  communication_type: "whatsapp",
  status: "sent",
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

**AI Response:**
```javascript
{
  _id: ObjectId("..."),
  channel_id: "507f1f77bcf86cd799439011",
  content: "Hello! How can I assist you today?",
  sender: "contact",
  type: "text",
  communication_type: "whatsapp",
  status: "sent",
  createdAt: ISODate("2024-01-15T10:30:02.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:02.000Z")
}
```

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Enable AI responses
AI_RESPONSES_ENABLED=true

# Response delay in milliseconds (simulates thinking time)
AI_RESPONSE_DELAY=2000

# AI provider: 'mock', 'openai', or 'anthropic'
AI_PROVIDER=mock
```

### Default Values

If not specified in `.env`:
- `AI_RESPONSES_ENABLED`: `false` (disabled by default)
- `AI_RESPONSE_DELAY`: `2000` (2 seconds)
- `AI_PROVIDER`: `mock`

## 🚀 Quick Start

### 1. Enable AI Responses

Edit your `.env` file:
```env
AI_RESPONSES_ENABLED=true
AI_RESPONSE_DELAY=2000
AI_PROVIDER=mock
```

### 2. Start the Server

```bash
npm run dev
```

### 3. Send a Test Message

The AI will automatically respond after the configured delay!

### 4. Check the Database

```bash
mongosh
use multichannel-chat
db.messages.find().sort({createdAt: -1}).limit(10)
```

You'll see both user and AI messages stored!

## 📡 API Endpoints

### Get AI Status

```bash
GET http://localhost:3000/api/ai/status
```

**Response:**
```json
{
  "enabled": true,
  "provider": "mock",
  "delay": 2000
}
```

### Enable AI Responses

```bash
POST http://localhost:3000/api/ai/enable
```

**Response:**
```json
{
  "message": "AI responses enabled",
  "enabled": true
}
```

### Disable AI Responses

```bash
POST http://localhost:3000/api/ai/disable
```

**Response:**
```json
{
  "message": "AI responses disabled",
  "enabled": false
}
```

### Test AI Response

```bash
POST http://localhost:3000/api/ai/test
Content-Type: application/json

{
  "message": "Hello!",
  "communication_type": "whatsapp"
}
```

**Response:**
```json
{
  "userMessage": "Hello!",
  "aiResponse": "Hello! How can I assist you today?",
  "enabled": true
}
```

## 🤖 AI Response Types

### Mock Provider (Default)

The mock provider generates context-aware responses:

**Greetings:**
- User: "Hello"
- AI: "Hello! How can I assist you today?"

**Questions:**
- User: "What time do you close?"
- AI: "That's a great question! Let me help you with that."

**Thank You:**
- User: "Thanks!"
- AI: "You're welcome! Is there anything else I can help with?"

**Goodbye:**
- User: "Bye"
- AI: "Goodbye! Have a wonderful day!"

**Help Requests:**
- User: "I need help"
- AI: "I'm here to help! You can ask me questions about our services..."

**Order Inquiries:**
- User: "Check my order"
- AI: "I can help you with that! Could you provide me with your order number?"

**General:**
- User: "..."
- AI: "Thanks for your message! I'm here to assist you."

## 🔧 Advanced Configuration

### Custom Response Delay

Set different delays based on message complexity:

```javascript
// In aiResponseService.js
async generateResponse(userMessage, communicationType) {
  // Longer delay for complex queries
  const delay = userMessage.includes('?') ? 3000 : 2000;
  await this.delay(delay);
  // ...
}
```

### Provider-Specific Settings

#### OpenAI Integration (Coming Soon)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=150
```

#### Anthropic Integration (Coming Soon)

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

## 📊 Monitoring

### Check Logs

```bash
# View AI response logs
.\view-logs.ps1 tail

# Look for:
# - "Generating AI response..."
# - "User message saved to DB: [id]"
# - "AI message saved to DB: [id]"
# - "AI response sent to clients via Socket.IO"
```

### Query Database

```javascript
// Find all messages for a channel
db.messages.find({ channel_id: "your_channel_id" })
  .sort({ createdAt: 1 });

// Count user vs AI messages
db.messages.aggregate([
  {
    $group: {
      _id: "$sender",
      count: { $sum: 1 }
    }
  }
]);

// Find recent AI responses
db.messages.find({ sender: "contact" })
  .sort({ createdAt: -1 })
  .limit(10);
```

## 🎨 Frontend Integration

The frontend automatically displays both user and AI messages:

```vue
<div class="message" :class="message.sender">
  <div class="message-content">{{ message.content }}</div>
  <div class="message-time">{{ formatTime(message.created_at) }}</div>
</div>
```

CSS styling differentiates user vs AI messages:
- User messages: Right-aligned, blue background
- AI messages: Left-aligned, gray background

## 🧪 Testing

### Manual Testing

1. **Start the app:** `npm run dev`
2. **Open chat interface:** http://localhost:8080/chat
3. **Send a message:** Type "Hello" and press send
4. **Wait for AI response:** Should appear after 2 seconds
5. **Check database:** Both messages should be stored

### Test API Endpoint

```bash
# Test without starting frontend
curl -X POST http://localhost:3000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "communication_type": "whatsapp"}'
```

### Integration Test

```javascript
// Example test (using Jest/Supertest)
describe('AI Responses', () => {
  it('should save both user and AI messages', async () => {
    // Send user message
    const response = await request(app)
      .post('/api/messages')
      .send({
        channel_id: testChannelId,
        content: 'Hello',
        sender: 'user',
        communication_type: 'whatsapp'
      });

    expect(response.status).toBe(201);

    // Wait for AI response
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check database
    const messages = await Message.find({ 
      channel_id: testChannelId 
    }).sort({ createdAt: 1 });

    expect(messages).toHaveLength(2);
    expect(messages[0].sender).toBe('user');
    expect(messages[1].sender).toBe('contact');
  });
});
```

## 🔐 Security Considerations

1. **Rate Limiting**: Consider adding rate limits to prevent spam
2. **Content Filtering**: Validate and sanitize message content
3. **API Key Protection**: Never commit API keys to version control
4. **Access Control**: Restrict AI API endpoints if needed

## 📈 Performance

### Optimization Tips

1. **Async Processing**: AI responses run asynchronously (don't block user message)
2. **Database Indexing**: Messages indexed by `channel_id` for fast queries
3. **Socket.IO**: Efficient real-time delivery
4. **Response Caching**: Consider caching common responses

### Metrics to Monitor

- Average AI response time
- User-to-AI message ratio
- Failed response rate
- Database write performance

## 🔄 Future Enhancements

- [ ] OpenAI GPT-4 integration
- [ ] Anthropic Claude integration
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] Learning from conversations
- [ ] Custom AI personalities
- [ ] Response templates
- [ ] Admin dashboard for AI management

## 🐛 Troubleshooting

### AI Responses Not Working

**Issue**: No AI responses appearing

**Solutions:**
1. Check `.env`: Ensure `AI_RESPONSES_ENABLED=true`
2. Check logs: `.\view-logs.ps1 tail`
3. Verify Socket.IO connection
4. Check MongoDB connection

### Duplicate Messages

**Issue**: Same AI response appearing multiple times

**Solutions:**
1. Check Socket.IO connection
2. Ensure unique message IDs
3. Verify frontend duplicate detection logic

### Slow Responses

**Issue**: AI responses taking too long

**Solutions:**
1. Reduce `AI_RESPONSE_DELAY` in `.env`
2. Check MongoDB performance
3. Monitor network latency

## 📚 Code Reference

### Key Files

- **`server/services/aiResponseService.js`** - AI response generation
- **`server/routes/messages.js`** - Message handling with AI integration
- **`server/routes/ai.js`** - AI control API endpoints
- **`server/models/Message.js`** - Message schema

### Key Functions

```javascript
// Generate AI response
aiResponseService.generateResponse(message, type)

// Save message to database
await message.save()

// Emit via Socket.IO
io.to(channel_id).emit('new_message', messageResponse)
```

---

## 💡 Example Use Cases

1. **Customer Support**: Auto-respond to common questions
2. **Lead Generation**: Engage visitors automatically
3. **Order Status**: Provide automated order updates
4. **FAQ Responses**: Answer frequently asked questions
5. **Appointment Booking**: Guide users through booking process

---

**Ready to get started?** Enable AI responses in your `.env` and watch your app come alive with intelligent conversations! 🤖✨

