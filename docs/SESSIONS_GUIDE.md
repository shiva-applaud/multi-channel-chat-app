# Session Management Guide

Complete guide to the session management feature in the Multi-Channel Chat App.

## Overview

Sessions organize conversations into separate, manageable segments within each channel. This allows users to:
- Organize multiple conversation threads per channel
- Archive old conversations
- View conversation history
- Manage different topics or time periods separately

## 🎯 Key Features

- ✅ **Multiple Sessions per Channel**: Create unlimited conversation sessions
- ✅ **Automatic Session Creation**: Sessions created automatically when sending messages
- ✅ **Session Filtering**: View messages from specific sessions
- ✅ **Session Management**: Create, archive, and delete sessions
- ✅ **Message Tracking**: Each session tracks message count and last activity
- ✅ **Status Management**: Active, archived, or closed sessions
- ✅ **Beautiful UI**: Glass-morphism design with smooth animations

## 📊 Database Schema

### Sessions Collection

```javascript
{
  _id: ObjectId,
  channel_id: String (required),
  title: String,
  description: String,
  status: String (enum: 'active', 'archived', 'closed'),
  message_count: Number,
  last_message_at: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Messages Collection (Updated)

```javascript
{
  _id: ObjectId,
  channel_id: String (required),
  session_id: String (required),  // NEW: Links message to session
  content: String (required),
  sender: String (enum: 'user', 'contact'),
  type: String,
  communication_type: String,
  status: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🚀 Quick Start

### Creating a Session

**Option 1: Automatic** (Recommended)
- Start chatting in any channel
- A session is automatically created
- Continue the conversation

**Option 2: Manual**
1. Navigate to `/sessions`
2. Click "New Session"
3. Select a channel
4. Optionally add title and description
5. Click "Create Session"

### Viewing Sessions

**Access the Sessions Page:**
```
http://localhost:8080/sessions
```

**From any page:**
- Home: Click "📋 View Sessions"
- Chat: Click the "📋" icon in sidebar header

**Features:**
- Grid view of all sessions
- Filter by channel or status
- See message count and last activity
- Click any session to view its messages

### Chatting in a Session

**Option 1: From Sessions Page**
1. Navigate to Sessions page
2. Click on a session card
3. Start chatting in that session

**Option 2: Direct Link**
```
http://localhost:8080/chat?channel_id=<channel_id>&session_id=<session_id>
```

**Option 3: Automatic**
- Select a channel in the chat interface
- If no session exists, one is created automatically
- All messages go to the active session

## 📡 API Endpoints

### Get All Sessions

```http
GET /api/sessions?channel_id=<id>&status=<status>

Query Parameters:
- channel_id (optional): Filter by channel
- status (optional): Filter by status (active, archived, closed)

Response:
[
  {
    "id": "session_id",
    "channel_id": "channel_id",
    "title": "Session 1/15/2024, 10:30:00 AM",
    "description": "",
    "status": "active",
    "message_count": 15,
    "last_message_at": "2024-01-15T10:45:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### Get Single Session

```http
GET /api/sessions/:id

Response:
{
  "id": "session_id",
  "channel_id": "channel_id",
  "title": "Session Title",
  "description": "Session description",
  "status": "active",
  "message_count": 15,
  "last_message_at": "2024-01-15T10:45:00.000Z",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:45:00.000Z"
}
```

### Get Messages for Session

```http
GET /api/sessions/:id/messages?limit=50&offset=0

Response:
[
  {
    "id": "message_id",
    "channel_id": "channel_id",
    "session_id": "session_id",
    "content": "Hello!",
    "sender": "user",
    "type": "text",
    "communication_type": "whatsapp",
    "status": "sent",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### Create Session

```http
POST /api/sessions

Body:
{
  "channel_id": "channel_id",
  "title": "My Session",  // optional
  "description": "Session description"  // optional
}

Response:
{
  "id": "new_session_id",
  "channel_id": "channel_id",
  "title": "My Session",
  "description": "Session description",
  "status": "active",
  "message_count": 0,
  "last_message_at": "2024-01-15T10:30:00.000Z",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Update Session

```http
PUT /api/sessions/:id

Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "archived"
}

Response:
{
  "id": "session_id",
  "title": "Updated Title",
  "status": "archived",
  ...
}
```

### Archive Session

```http
POST /api/sessions/:id/archive

Response:
{
  "message": "Session archived successfully",
  "session": {
    "id": "session_id",
    "status": "archived"
  }
}
```

### Delete Session

```http
DELETE /api/sessions/:id?delete_messages=true

Query Parameters:
- delete_messages (optional): Set to "true" to delete all messages in session

Response:
{
  "message": "Session deleted successfully",
  "messages_deleted": true
}
```

### Send Message with Session

```http
POST /api/messages

Body:
{
  "channel_id": "channel_id",
  "session_id": "session_id",  // optional - auto-created if not provided
  "content": "Hello!",
  "sender": "user",
  "type": "text",
  "communication_type": "whatsapp"
}

Response:
{
  "id": "message_id",
  "channel_id": "channel_id",
  "session_id": "session_id",  // returned session (new or existing)
  "content": "Hello!",
  ...
}
```

## 💡 Use Cases

### 1. Customer Support
- One session per support ticket
- Archive resolved sessions
- Easy reference to past conversations

### 2. Sales Conversations
- Track different leads separately
- Organize by sales stage
- Review conversation history

### 3. Project Discussions
- One session per project
- Keep topics organized
- Find project-related conversations easily

### 4. Time-Based Organization
- Weekly or monthly sessions
- Archive old periods
- Maintain clean active session list

### 5. Topic-Based Conversations
- Separate sessions for different topics
- Easy switching between discussions
- Clear conversation context

## 🎨 UI Features

### Sessions Page

**Grid Layout:**
- Cards showing all sessions
- Filter by channel or status
- Visual status indicators
- Message count and last activity
- Click to open session

**Filters:**
- Channel dropdown
- Status dropdown (All, Active, Archived, Closed)
- Real-time filtering

**Session Cards Display:**
- Title and description
- Status badge (Active/Archived/Closed)
- Message count with icon
- Last activity time (relative format)
- Channel name
- Quick action buttons

**Actions:**
- Archive session
- Delete session
- Edit session (via update)

### Chat Interface

**Session Integration:**
- Transparent session handling
- Auto-creation when needed
- Session ID in URL params
- Filter messages by session

**Navigation:**
- Sessions button in sidebar
- Easy access from chat
- Direct session linking

## 🔧 Implementation Details

### Automatic Session Creation

When a user sends a message without specifying a session:

```javascript
// Backend logic
if (!session_id) {
  // Find most recent active session for this channel
  let session = await Session.findOne({ 
    channel_id, 
    status: 'active' 
  }).sort({ last_message_at: -1 });
  
  // If no active session exists, create one
  if (!session) {
    session = new Session({
      channel_id,
      title: `Session ${new Date().toLocaleString()}`,
      status: 'active',
      message_count: 0
    });
    await session.save();
  }
  
  session_id = session._id.toString();
}
```

### Message Count Tracking

Every message sent updates the session:

```javascript
await Session.findByIdAndUpdate(session_id, {
  $inc: { message_count: 1 },
  last_message_at: new Date()
});
```

### Session Filtering

Get messages for specific session:

```javascript
// Frontend
const url = `http://localhost:3000/api/messages/channel/${channel_id}?session_id=${session_id}`;

// Backend
const filter = { channel_id };
if (session_id) filter.session_id = session_id;
const messages = await Message.find(filter);
```

## 🧪 Testing

### Manual Testing

1. **Create Session Flow:**
   ```bash
   1. Start app: npm run dev
   2. Navigate to http://localhost:8080/sessions
   3. Click "New Session"
   4. Select channel
   5. Create session
   6. Verify session appears in list
   ```

2. **Chat in Session:**
   ```bash
   1. Click on a session
   2. Send messages
   3. Verify messages appear
   4. Check message count updates
   ```

3. **Filter Sessions:**
   ```bash
   1. Create sessions in different channels
   2. Use channel filter dropdown
   3. Verify filtering works
   4. Test status filter
   ```

4. **Archive Session:**
   ```bash
   1. Click archive button on session
   2. Verify status changes to "archived"
   3. Filter by archived status
   ```

### API Testing

```bash
# Create session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"channel_id":"<channel_id>","title":"Test Session"}'

# Get all sessions
curl http://localhost:3000/api/sessions

# Get session messages
curl http://localhost:3000/api/sessions/<session_id>/messages

# Send message in session
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id":"<channel_id>",
    "session_id":"<session_id>",
    "content":"Hello!",
    "sender":"user",
    "communication_type":"whatsapp"
  }'

# Archive session
curl -X POST http://localhost:3000/api/sessions/<session_id>/archive

# Delete session
curl -X DELETE "http://localhost:3000/api/sessions/<session_id>?delete_messages=true"
```

### Database Verification

```javascript
// Check sessions
db.sessions.find().sort({createdAt: -1}).limit(10);

// Check messages with session_id
db.messages.find({ session_id: "your_session_id" });

// Count messages per session
db.messages.aggregate([
  {
    $group: {
      _id: "$session_id",
      count: { $sum: 1 }
    }
  }
]);

// Find sessions without messages
db.sessions.aggregate([
  {
    $lookup: {
      from: "messages",
      localField: "_id",
      foreignField: "session_id",
      as: "messages"
    }
  },
  {
    $match: {
      messages: { $size: 0 }
    }
  }
]);
```

## 🔍 Troubleshooting

### Session Not Created

**Issue**: Messages sent but no session created

**Solutions**:
1. Check MongoDB connection
2. Verify Session model imported correctly
3. Check server logs: `.\view-logs.ps1 tail`
4. Ensure channel_id is valid

### Messages Not Showing

**Issue**: Messages sent but don't appear in session

**Solutions**:
1. Verify session_id in message document
2. Check filter parameters in API call
3. Reload messages: refresh chat page
4. Check socket.IO connection

### Session Count Wrong

**Issue**: message_count doesn't match actual messages

**Solutions**:
1. Re-count messages for session:
   ```javascript
   const count = await Message.countDocuments({ session_id });
   await Session.findByIdAndUpdate(session_id, { message_count: count });
   ```

2. Ensure all message routes update session count

## 📚 Best Practices

1. **Session Naming**: Use descriptive titles
2. **Regular Archiving**: Archive completed conversations
3. **Cleanup**: Delete very old, empty sessions
4. **Organization**: Use one session per topic/period
5. **Status Management**: Keep sessions in appropriate status

## 🔮 Future Enhancements

- [ ] Session search functionality
- [ ] Session tags/labels
- [ ] Session sharing between users
- [ ] Session export to PDF/CSV
- [ ] Session analytics
- [ ] Auto-archive old sessions
- [ ] Session templates
- [ ] Session notes/annotations
- [ ] Bulk session operations

---

**Created**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready

