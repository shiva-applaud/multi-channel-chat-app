# Multi-Channel Chat App - Backend

Express.js backend server with Socket.IO for real-time messaging, MongoDB data storage, and Twilio integration.

## Features

- RESTful API for channels, messages, and contacts
- Real-time messaging with Socket.IO
- Twilio integration for phone number generation
- MongoDB database with Mongoose ODM
- Indexed collections for performance
- Winston logging
- CORS enabled

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install and start MongoDB (see [MONGODB_SETUP.md](../MONGODB_SETUP.md) in root)

3. Configure environment variables:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
# Use 127.0.0.1 to force IPv4 and avoid connection issues
MONGODB_URI=mongodb://127.0.0.1:27017/multichannel-chat
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Channels

- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get single channel
- `POST /api/channels` - Create new channel
- `POST /api/channels/generate-phone-number` - Generate phone number via Twilio
- `DELETE /api/channels/:id` - Delete channel

### Messages

- `GET /api/messages/:channelId` - Get messages for a channel
- `POST /api/messages` - Send a message

### Health Check

- `GET /health` - Server health status

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080
# Use 127.0.0.1 instead of localhost to force IPv4
MONGODB_URI=mongodb://127.0.0.1:27017/multichannel-chat
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

For MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/multichannel-chat
```

**Note:** Using `127.0.0.1` instead of `localhost` forces IPv4 connection and prevents `ECONNREFUSED ::1:27017` errors on systems where Node.js defaults to IPv6.

## Socket.IO Events

### Client → Server
- `join_channel` - Join a channel room
- `leave_channel` - Leave a channel room
- `send_message` - Send a message

### Server → Client
- `new_message` - New message received
- `error` - Error occurred

## Database Schema (MongoDB/Mongoose)

### Channels Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  phone_number: String (required),
  country_code: String (required),
  type: String (enum: ['whatsapp', 'sms', 'voice']),
  status: String (enum: ['active', 'inactive', 'suspended']),
  twilio_sid: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
{ phone_number: 1 }
{ type: 1 }
{ status: 1 }
{ createdAt: -1 }
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  channel_id: String (required, indexed),
  content: String (required),
  sender: String (enum: ['user', 'contact']),
  type: String (enum: ['text', 'image', 'video', 'audio', 'file']),
  communication_type: String (enum: ['whatsapp', 'sms', 'voice']),
  status: String (enum: ['sent', 'delivered', 'read', 'failed']),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
{ channel_id: 1, createdAt: -1 }
{ sender: 1 }
{ communication_type: 1 }
{ status: 1 }
```

### Contacts Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  phone_number: String (required, unique),
  email: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes
{ phone_number: 1 } (unique)
{ email: 1 }
{ name: 1 }
```

## Project Structure

```
server/
├── config/           # Configuration files
├── db/              # Database connection setup
├── models/          # Mongoose models
│   ├── Channel.js   # Channel schema
│   ├── Message.js   # Message schema
│   └── Contact.js   # Contact schema
├── logs/            # Winston logs
├── middleware/      # Express middleware
├── routes/          # API routes
│   ├── channels.js  # Channel endpoints
│   ├── messages.js  # Message endpoints
│   └── contacts.js  # Contact endpoints
├── services/        # Business logic
│   ├── messaging/   # Messaging services
│   └── twilioService.js  # Twilio integration
├── tests/           # Test files
├── utils/           # Utility functions
└── index.js         # Server entry point
```

## Logging

Logs are stored in `server/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

## Development

```bash
# Start with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production

```bash
npm start
```
