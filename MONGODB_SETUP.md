# MongoDB Setup Guide

This application uses MongoDB for data storage. Follow this guide to set up MongoDB locally or use a cloud service like MongoDB Atlas.

## Option 1: Local MongoDB Installation

### Windows

1. **Download MongoDB Community Server**:
   - Go to https://www.mongodb.com/try/download/community
   - Select your Windows version
   - Download the MSI installer

2. **Install MongoDB**:
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool) if desired

3. **Verify Installation**:
   ```bash
   mongod --version
   ```

4. **Start MongoDB** (if not running as service):
   ```bash
   mongod
   ```

### macOS

Using Homebrew:
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0

# Verify
mongosh --version
```

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod
```

## Option 2: MongoDB Atlas (Cloud)

MongoDB Atlas is a free cloud-hosted MongoDB service.

1. **Create Account**:
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free (no credit card required for free tier)

2. **Create a Cluster**:
   - Choose "Build a Database"
   - Select "Shared" (Free tier)
   - Choose your cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Set Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with your database name (e.g., `multichannel-chat`)

   Example:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/multichannel-chat?retryWrites=true&w=majority
   ```

## Application Configuration

### Environment Variables

Create or update your `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080

# MongoDB Configuration
# For local MongoDB (use 127.0.0.1 to force IPv4 and avoid connection issues):
MONGODB_URI=mongodb://127.0.0.1:27017/multichannel-chat

# For MongoDB Atlas (use your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/multichannel-chat?retryWrites=true&w=majority

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

### Database Collections

The application will automatically create these collections:

1. **channels** - Phone number channels
   - name (String)
   - phone_number (String)
   - country_code (String)
   - type (String: whatsapp, sms, voice)
   - status (String: active, inactive, suspended)
   - twilio_sid (String, optional)
   - timestamps (createdAt, updatedAt)

2. **messages** - Chat messages
   - channel_id (String)
   - content (String)
   - sender (String: user, contact)
   - type (String: text, image, video, audio, file)
   - communication_type (String: whatsapp, sms, voice)
   - status (String: sent, delivered, read, failed)
   - timestamps (createdAt, updatedAt)

3. **contacts** - Contact information
   - name (String)
   - phone_number (String, unique)
   - email (String, optional)
   - timestamps (createdAt, updatedAt)

## Verify Connection

After configuration, start your server:

```bash
npm run dev
```

You should see in the logs:
```
✓ Connected to MongoDB successfully
  Database: multichannel-chat
  Host: localhost (or your Atlas host)
```

## MongoDB GUI Tools

### MongoDB Compass (Recommended)

1. Download from https://www.mongodb.com/products/compass
2. Connect using your connection string
3. Browse collections, run queries, analyze performance

### VS Code Extension

Install "MongoDB for VS Code":
1. Open VS Code Extensions
2. Search for "MongoDB"
3. Install the official MongoDB extension
4. Connect using your URI

## Useful MongoDB Commands

### Using mongosh (MongoDB Shell)

```bash
# Connect to local MongoDB
mongosh

# Connect to specific database
mongosh "mongodb://localhost:27017/multichannel-chat"

# Connect to Atlas
mongosh "your-atlas-connection-string"
```

### Common Operations

```javascript
// Show databases
show dbs

// Use database
use multichannel-chat

// Show collections
show collections

// Find all channels
db.channels.find()

// Find all messages for a channel
db.messages.find({ channel_id: "channel_id_here" })

// Count documents
db.channels.countDocuments()

// Delete all data (careful!)
db.channels.deleteMany({})
db.messages.deleteMany({})
db.contacts.deleteMany({})

// Create index for better performance
db.messages.createIndex({ channel_id: 1, createdAt: -1 })

// Show indexes
db.channels.getIndexes()
```

## Troubleshooting

### Connection Refused

**Problem**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:
1. Make sure MongoDB is running:
   ```bash
   # Windows (if not a service)
   mongod

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

2. Check if port 27017 is in use:
   ```bash
   # Windows
   netstat -ano | findstr :27017

   # Mac/Linux
   lsof -i :27017
   ```

### Authentication Failed

**Problem**: `MongoServerError: Authentication failed`

**Solutions**:
1. Check username and password in connection string
2. Ensure user has correct permissions in Atlas
3. URL-encode special characters in password

### Atlas Connection Issues

**Problem**: Cannot connect to MongoDB Atlas

**Solutions**:
1. Check Network Access whitelist in Atlas
2. Verify your IP address is allowed
3. For development, temporarily allow 0.0.0.0/0
4. Check connection string format
5. Ensure password is URL-encoded

### Slow Queries

**Problem**: Database operations are slow

**Solutions**:
1. Create indexes on frequently queried fields:
   ```javascript
   db.messages.createIndex({ channel_id: 1, createdAt: -1 })
   db.channels.createIndex({ phone_number: 1 })
   ```

2. Use `.lean()` in Mongoose queries for better performance
3. Limit result sets with `.limit()`
4. Use MongoDB Compass to analyze query performance

## Data Migration from SQLite

If you have existing SQLite data, here's how to migrate:

### Export from SQLite

```bash
# Connect to SQLite database
sqlite3 server/data/chat.db

# Export channels to JSON
.mode json
.output channels.json
SELECT * FROM channels;
.output stdout

# Export messages
.output messages.json
SELECT * FROM messages;
.output stdout
```

### Import to MongoDB

Create a migration script `migrate.js`:

```javascript
const mongoose = require('mongoose');
const fs = require('fs');
const Channel = require('./server/models/Channel');
const Message = require('./server/models/Message');

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/multichannel-chat');

  // Import channels
  const channels = JSON.parse(fs.readFileSync('channels.json'));
  for (const ch of channels) {
    await Channel.create({
      name: ch.name,
      phone_number: ch.phone_number,
      country_code: ch.country_code,
      type: ch.type,
      status: ch.status,
      twilio_sid: ch.twilio_sid
    });
  }

  // Import messages
  const messages = JSON.parse(fs.readFileSync('messages.json'));
  for (const msg of messages) {
    await Message.create({
      channel_id: msg.channel_id,
      content: msg.content,
      sender: msg.sender,
      type: msg.type,
      communication_type: msg.communication_type,
      status: msg.status
    });
  }

  console.log('Migration complete!');
  await mongoose.disconnect();
}

migrate();
```

Run migration:
```bash
node migrate.js
```

## Performance Tips

1. **Use Indexes**: Create indexes on frequently queried fields
2. **Use Lean Queries**: Add `.lean()` to Mongoose queries that don't need full documents
3. **Limit Results**: Always use `.limit()` when fetching multiple documents
4. **Connection Pooling**: MongoDB driver handles this automatically
5. **Monitor**: Use MongoDB Atlas monitoring or Compass for performance insights

## Security Best Practices

1. **Never commit credentials**: Keep `.env` in `.gitignore`
2. **Use environment variables**: Never hardcode connection strings
3. **Restrict network access**: Only allow necessary IP addresses in Atlas
4. **Use strong passwords**: For Atlas users
5. **Regular backups**: Enable automated backups in Atlas
6. **Monitor access**: Check Atlas access logs regularly

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)

---

**Need Help?**
- Check server logs for detailed error messages
- MongoDB Community Forums: https://www.mongodb.com/community/forums
- Stack Overflow: Tag questions with [mongodb] and [mongoose]

