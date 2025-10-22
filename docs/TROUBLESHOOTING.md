# Troubleshooting Guide

## Common Issues and Solutions

### Port Already in Use Error

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Kill all running Node.js processes:
```powershell
taskkill /F /IM node.exe
```

Then restart the servers:
```bash
npm run dev
```

### ESLint Configuration Missing

**Error:** `No ESLint configuration found`

**Solution:** Ensure `.eslintrc.js` exists in the `client/` directory with proper configuration.

The project now includes:
- `client/.eslintrc.js` - ESLint configuration
- `client/.eslintignore` - Files to ignore for linting

### Module Not Found Errors

**Error:** `Module not found: Error: Can't resolve './router'`

**Solution:** Ensure all required files exist:
- `client/src/router/index.js`
- `client/src/store/index.js`
- `client/src/main.js`
- `client/src/App.vue`

### Multiple index.html Conflict

**Error:** `Conflict: Multiple assets emit different content to the same filename index.html`

**Solution:** This was resolved by removing duplicate template files from node_modules. If it occurs again:
1. Clean the build: `cd client && npm run build` or delete `dist/` folder
2. Clear node_modules cache: `cd client && rm -rf node_modules && npm install`

## Verification Steps

After starting the servers with `npm run dev`, verify they're running:

1. **Check if ports are listening:**
   ```powershell
   netstat -ano | findstr "3000 8080" | findstr "LISTENING"
   ```

2. **Test server health:**
   ```powershell
   Invoke-RestMethod -Uri http://localhost:3000/health
   ```
   Should return: `{ "status": "ok", "timestamp": "..." }`

3. **Test client accessibility:**
   ```powershell
   Invoke-WebRequest -Uri http://localhost:8080 -UseBasicParsing
   ```
   Should return status code 200

## Development Workflow

1. **First time setup:**
   ```bash
   npm run install-all
   cd server
   # Create .env file (see server/.env.example)
   cd ..
   npm run dev
   ```

2. **Daily development:**
   ```bash
   npm run dev
   ```

3. **If you encounter errors:**
   - Check this troubleshooting guide
   - Kill all node processes and restart
   - View logs: `.\view-logs.ps1` or `.\view-logs.bat`
   - Check `server/logs/error.log` for specific errors
   - Verify `.env` file exists in project root
   - Ensure MongoDB is running

## Directory Structure Verification

Ensure your project has this structure:

```
multi-channel-chat-app/
├── client/
│   ├── .eslintrc.js          ✓
│   ├── .eslintignore         ✓
│   ├── package.json          ✓
│   ├── babel.config.js       ✓
│   ├── vue.config.js         ✓
│   ├── public/
│   │   └── index.html        ✓
│   └── src/
│       ├── main.js           ✓
│       ├── App.vue           ✓
│       ├── router/
│       │   └── index.js      ✓
│       ├── store/
│       │   └── index.js      ✓
│       └── views/
│           ├── Home.vue      ✓
│           └── Chat.vue      ✓
├── server/
│   ├── package.json          ✓
│   ├── .env                  ✓
│   ├── .gitignore            ✓
│   ├── index.js              ✓
│   ├── routes/               ✓
│   ├── services/             ✓
│   ├── db/                   ✓
│   ├── utils/                ✓
│   ├── logs/                 ✓
│   └── data/                 ✓
└── package.json              ✓
```

## Viewing Backend Logs

### Log File Locations

Backend logs are stored in `server/logs/`:
- **`server/logs/combined.log`** - All logs (info, warnings, errors)
- **`server/logs/error.log`** - Only error logs

### Method 1: Real-time Console Output

Watch logs in real-time in your terminal:
```bash
npm run dev
```

You'll see colorized logs like:
```
2024-01-15 10:30:00 info: Server started on port 3000
2024-01-15 10:30:01 info: ✓ Connected to MongoDB successfully
2024-01-15 10:30:02 info: Generating phone number for country: USA
```

### Method 2: Using Log Viewer Scripts

**PowerShell (Recommended):**
```powershell
# View all logs
.\view-logs.ps1

# View error logs only
.\view-logs.ps1 error

# Follow logs in real-time (like tail -f)
.\view-logs.ps1 tail

# Clear log files
.\view-logs.ps1 clear

# Show help
.\view-logs.ps1 help
```

**Command Prompt:**
```cmd
# View all logs
view-logs.bat

# View error logs only
view-logs.bat error

# Clear log files
view-logs.bat clear
```

### Method 3: Manual File Viewing

**PowerShell:**
```powershell
# View last 50 lines of all logs
Get-Content server\logs\combined.log -Tail 50

# View error logs
Get-Content server\logs\error.log -Tail 50

# Follow logs in real-time
Get-Content server\logs\combined.log -Wait -Tail 10
```

**Command Prompt:**
```cmd
# View all logs
type server\logs\combined.log

# View error logs
type server\logs\error.log
```

**VS Code:**
- Open the files directly: `server/logs/combined.log` and `server/logs/error.log`
- Use the "Tail" extension for real-time log viewing

### Method 4: VS Code Terminal

In VS Code, open a new terminal and run:
```bash
# Windows PowerShell
Get-Content server\logs\combined.log -Wait -Tail 20

# Git Bash or WSL
tail -f server/logs/combined.log
```

### Log Levels

The logger supports different levels (set via `LOG_LEVEL` in `.env`):
- **error**: Only errors
- **warn**: Warnings and errors
- **info**: Info, warnings, and errors (default)
- **debug**: Debug info + all above
- **verbose**: Very detailed logging

Example `.env`:
```env
LOG_LEVEL=debug
```

### Common Log Entries

**Successful startup:**
```
info: Server started on port 3000
info: ✓ Connected to MongoDB successfully
info: Database: multichannel-chat
info: Host: localhost
```

**Phone number generation:**
```
info: Generating phone number for country: USA
info: Phone number obtained: +15551234567
info: Phone number stored in MongoDB with ID: 507f1f77bcf86cd799439011
```

**Errors:**
```
error: MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
error: Failed to connect to MongoDB
```

### Debugging Tips

1. **Check logs when server starts** - Look for connection confirmations
2. **Monitor logs during API calls** - See request/response flow
3. **Check error.log first** - When something goes wrong
4. **Clear logs periodically** - Use `.\view-logs.ps1 clear` to start fresh
5. **Use real-time tail** - For debugging live issues

### Client-Side Logs

- **Browser Console:** Open DevTools (F12) → Console tab
- **Network Requests:** DevTools → Network tab
- **Vue DevTools:** Install the Vue DevTools browser extension

## MongoDB Connection Issues

### Error: Connection Refused

**Error:** `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. **Check if MongoDB is running:**
   ```powershell
   # Check MongoDB service
   Get-Service | Where-Object {$_.Name -like "*mongo*"}
   
   # Or check if port 27017 is listening
   netstat -ano | findstr :27017
   ```

2. **Start MongoDB:**
   ```powershell
   # If installed as Windows service
   net start MongoDB
   
   # Or run manually
   mongod
   ```

3. **Verify connection string in `.env`:**
   ```env
   # Use 127.0.0.1 instead of localhost to avoid IPv6 issues
   MONGODB_URI=mongodb://127.0.0.1:27017/multichannel-chat
   ```

### Error: IPv6 Connection Issues

**Error:** `connect ECONNREFUSED ::1:27017`

**Cause**: Node.js is trying to connect via IPv6 (`::1`) but MongoDB is listening on IPv4 (`127.0.0.1`)

**Solutions:**
1. **Use IPv4 explicitly in connection string:**
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/multichannel-chat
   ```

2. **Configure MongoDB to listen on both IPv4 and IPv6:**
   Edit MongoDB config file (`mongod.cfg` or `/etc/mongod.conf`):
   ```yaml
   net:
     bindIp: 127.0.0.1,::1
   ```

3. **Disable IPv6 on your system** (if not needed):
   - Windows: Network Adapter Settings → TCP/IPv6 → Uncheck
   - Linux: `sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1`

### Error: Authentication Failed

**Error:** `MongoServerError: Authentication failed`

**Solutions:**
1. Check username and password in connection string
2. For Atlas: Verify user has correct permissions
3. URL-encode special characters in password

## Getting Help

If problems persist:
1. **View backend logs:** `.\view-logs.ps1` or check `server/logs/error.log`
2. **Check MongoDB connection:** Verify MongoDB is running
3. **Reinstall dependencies:** `npm run install-all`
4. **Verify Node.js version:** Should be v14 or higher
5. **Check firewall:** Ensure ports 3000, 8080, and 27017 are not blocked
6. **Review documentation:**
   - [MongoDB Setup](./MONGODB_SETUP.md)
   - [Twilio Setup](./TWILIO_SETUP.md)
   - [Phone Number Flow](./PHONE_NUMBER_FLOW.md)

