# Session Communication Types

Sessions are now differentiated by communication type (WhatsApp, SMS, Voice Call), allowing you to organize conversations based on the channel type.

---

## Overview

Each session is associated with a specific communication type:
- **WhatsApp** (`whatsapp`) - For WhatsApp conversations
- **SMS** (`sms`) - For text message conversations  
- **Voice Call** (`voice`) - For voice call logs

This ensures that WhatsApp, SMS, and Voice conversations are kept separate, even within the same channel.

---

## Database Changes

### Session Model

The `Session` model now includes a required `communication_type` field:

```javascript
{
  _id: ObjectId,
  channel_id: String (required),
  communication_type: String (required),  // 'whatsapp', 'sms', or 'voice'
  title: String,
  description: String,
  status: String (enum: ['active', 'archived', 'closed']),
  message_count: Number,
  last_message_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Automatic Title Generation

Sessions now get auto-generated titles based on their type:
- WhatsApp sessions: `"WhatsApp Session 1/15/2024, 9:00:00 AM"`
- SMS sessions: `"Sms Session 1/15/2024, 9:00:00 AM"`
- Voice sessions: `"Voice Session 1/15/2024, 9:00:00 AM"`

---

## API Updates

### Create Session

**Endpoint:** `POST /api/sessions`

**Request:**
```json
{
  "channel_id": "123",
  "communication_type": "whatsapp",  // REQUIRED: 'whatsapp', 'sms', or 'voice'
  "title": "Custom Title (optional)",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "channel_id": "123",
  "communication_type": "whatsapp",
  "title": "WhatsApp Session 1/15/2024, 9:00:00 AM",
  "description": "",
  "status": "active",
  "message_count": 0,
  "last_message_at": "2024-01-15T09:00:00.000Z",
  "created_at": "2024-01-15T09:00:00.000Z"
}
```

### Get Sessions with Filter

**Endpoint:** `GET /api/sessions`

**Query Parameters:**
- `channel_id` - Filter by channel
- `communication_type` - Filter by type: `whatsapp`, `sms`, or `voice`
- `status` - Filter by status: `active`, `archived`, or `closed`

**Examples:**
```bash
# Get all WhatsApp sessions
GET /api/sessions?communication_type=whatsapp

# Get all active SMS sessions for a channel
GET /api/sessions?channel_id=123&communication_type=sms&status=active

# Get all voice sessions
GET /api/sessions?communication_type=voice
```

---

## Automatic Session Management

When sending a message without a `session_id`, the backend automatically:

1. **Finds** the latest active session for that channel **and** communication type
2. **Creates** a new session if none exists, with the appropriate communication type
3. **Uses** the found/created session for the message

**Example:**
```javascript
// Send WhatsApp message without session_id
POST /api/messages
{
  "channel_id": "123",
  "communication_type": "whatsapp",
  "content": "Hello!",
  "sender": "user"
}

// Backend finds/creates a WhatsApp session for channel 123
// Returns the message with the session_id included
```

**Important**: Sessions are now created per communication type, so:
- WhatsApp messages go to WhatsApp sessions
- SMS messages go to SMS sessions
- Voice messages go to Voice sessions

---

## Frontend Updates

### Sessions Page

The `/sessions` page now includes:

1. **Type Filter Dropdown**
   - Filter sessions by communication type
   - Options: All Types, WhatsApp, SMS, Voice Call

2. **Type Badges on Session Cards**
   - Visual indicator showing the communication type
   - Color-coded:
     - 💚 WhatsApp - Green
     - 💬 SMS - Blue
     - 📞 Voice - Purple

3. **Type Selection in Create Dialog**
   - Required field when creating a session
   - Dropdown with WhatsApp, SMS, Voice options

### Chat Page

The chat interface automatically uses the active tab's communication type:
- When in WhatsApp tab → Uses/creates WhatsApp sessions
- When in SMS tab → Uses/creates SMS sessions
- When in Voice tab → Uses/creates Voice sessions

---

## Usage Examples

### Example 1: Create WhatsApp Session

```javascript
const session = await axios.post('http://localhost:3000/api/sessions', {
  channel_id: '123',
  communication_type: 'whatsapp',
  title: 'Customer Support Chat',
  description: 'Helping with order issue'
});

console.log(session.data);
// {
//   id: '507f1f77bcf86cd799439011',
//   channel_id: '123',
//   communication_type: 'whatsapp',
//   title: 'Customer Support Chat',
//   ...
// }
```

### Example 2: Filter SMS Sessions

```javascript
const smsSessions = await axios.get('http://localhost:3000/api/sessions', {
  params: {
    communication_type: 'sms',
    status: 'active'
  }
});

console.log(smsSessions.data); // Only SMS sessions
```

### Example 3: Send Message (Auto Session)

```javascript
// Send WhatsApp message - session auto-created
const message = await axios.post('http://localhost:3000/api/messages', {
  channel_id: '123',
  communication_type: 'whatsapp',
  content: 'Hello!',
  sender: 'user'
});

console.log(message.data.session_id); // Auto-assigned WhatsApp session
```

---

## Migration Notes

### Existing Sessions

If you have existing sessions without a `communication_type`:
1. They will fail validation
2. You need to add `communication_type` to all existing sessions
3. Run a migration script:

```javascript
// Example migration
const sessions = await Session.find({ communication_type: { $exists: false } });

for (const session of sessions) {
  // Infer type from first message or channel
  const message = await Message.findOne({ session_id: session._id.toString() });
  session.communication_type = message?.communication_type || 'whatsapp';
  await session.save();
}
```

---

## Benefits

✅ **Clear Organization**: WhatsApp, SMS, and Voice conversations are separate  
✅ **Better Filtering**: Easily find sessions by type  
✅ **Automatic Management**: Backend handles session creation by type  
✅ **Visual Clarity**: Type badges make it easy to identify session types  
✅ **Consistent Data**: All sessions have a defined communication type  

---

## Testing

### Test Checklist

- [ ] Create WhatsApp session manually
- [ ] Create SMS session manually
- [ ] Create Voice session manually
- [ ] Send WhatsApp message (auto-create session)
- [ ] Send SMS message (auto-create session)
- [ ] Filter sessions by type
- [ ] Verify type badges display correctly
- [ ] Verify sessions are separated by type
- [ ] Check that switching tabs uses correct session type

### Test Commands

```bash
# Create WhatsApp session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"channel_id":"123","communication_type":"whatsapp"}'

# Get WhatsApp sessions only
curl "http://localhost:3000/api/sessions?communication_type=whatsapp"

# Send SMS message (auto-creates SMS session)
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"channel_id":"123","communication_type":"sms","content":"Test","sender":"user"}'
```

---

## Summary

Sessions are now **type-specific**, ensuring that WhatsApp, SMS, and Voice conversations are properly separated and organized. The system automatically manages sessions based on communication type, making it seamless for users while maintaining clean data organization.

