# Twilio Setup Guide

This guide will help you configure Twilio for phone number generation in the Multi-Channel Chat App.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com/try-twilio)
2. Node.js and npm installed
3. The application cloned and set up

## Step 1: Get Your Twilio Credentials

1. **Sign up for Twilio** (if you haven't already):
   - Go to https://www.twilio.com/try-twilio
   - Create a free account (you'll get some trial credit)

2. **Find Your Credentials**:
   - Log in to the Twilio Console: https://console.twilio.com/
   - On the dashboard, you'll see:
     - **Account SID** - Your unique account identifier
     - **Auth Token** - Your authentication token (click to reveal)

3. **Copy these credentials** - you'll need them for the next step

## Step 2: Configure Environment Variables

1. **Create a `.env` file** in the root directory of the project:
   ```bash
   # From the project root
   touch .env
   ```

2. **Add your Twilio credentials** to the `.env` file:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   CLIENT_URL=http://localhost:8080

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_actual_account_sid_here
   TWILIO_AUTH_TOKEN=your_actual_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

   # Database
   DB_PATH=./server/data/chat.db
   ```

3. **Replace the placeholder values**:
   - Replace `your_actual_account_sid_here` with your Account SID
   - Replace `your_actual_auth_token_here` with your Auth Token
   - Replace `your_twilio_phone_number_here` with a Twilio number (optional, for outbound calls)

## Step 3: Install Twilio SDK

The Twilio SDK should already be in your `package.json`, but if not:

```bash
cd server
npm install twilio
```

## Step 4: Test the Integration

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the Phone Config page** in the app:
   - Go to http://localhost:8080/phone-config
   - Enter a country name (e.g., "USA", "India", "UK")
   - Click "Generate Phone Number"

3. **What happens**:
   - ✅ **With Twilio configured**: The app will purchase a real phone number from Twilio
   - ⚠️ **Without Twilio configured**: The app will generate a mock phone number (for testing)

## Understanding Phone Number Costs

### Twilio Pricing (as of 2024)

- **Phone Number**: ~$1-2/month (varies by country)
- **Trial Account**: You get free credit to test
- **SMS**: ~$0.0075 per message
- **Voice Calls**: ~$0.013 per minute

**Important**: Twilio will charge you when you purchase phone numbers. Always monitor your usage in the Twilio Console.

## Supported Countries

The app currently supports phone number generation for:

- 🇺🇸 USA (US)
- 🇨🇦 Canada (CA)
- 🇬🇧 United Kingdom (GB)
- 🇮🇳 India (IN)
- 🇦🇺 Australia (AU)
- 🇩🇪 Germany (DE)
- 🇫🇷 France (FR)
- 🇯🇵 Japan (JP)
- 🇨🇳 China (CN)
- 🇧🇷 Brazil (BR)
- 🇲🇽 Mexico (MX)
- 🇪🇸 Spain (ES)
- 🇮🇹 Italy (IT)
- 🇳🇱 Netherlands (NL)

More countries can be added in `server/services/twilioService.js`.

## Mock Mode (Without Twilio)

If you don't configure Twilio credentials, the app will work in **mock mode**:

- ✅ You can test the full UI flow
- ✅ Mock phone numbers are generated
- ❌ No real SMS/calls will work
- ❌ Numbers are randomly generated (not real)

This is perfect for:
- Development and testing
- UI/UX work
- Demo purposes

## Troubleshooting

### Error: "No available phone numbers in [country]"

**Solution**: Not all countries have available phone numbers. Try:
1. A different country (USA usually has plenty)
2. Check Twilio's coverage: https://www.twilio.com/docs/phone-numbers

### Error: "Authentication failed"

**Solution**: Check your credentials:
1. Make sure Account SID and Auth Token are correct
2. No extra spaces in the `.env` file
3. Restart the server after changing `.env`

### Error: "Insufficient funds"

**Solution**: 
1. Add credit to your Twilio account
2. Or use mock mode for testing

### Mock numbers are being generated instead of real ones

**Solution**:
1. Check that `.env` file exists in the project root
2. Verify credentials are correct (not placeholder values)
3. Restart the server: `npm run dev`
4. Check server logs for Twilio initialization messages

## Security Best Practices

⚠️ **Important Security Notes**:

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Don't share your Auth Token** - It's like a password
3. **Rotate tokens regularly** - In Twilio Console > Settings > API Keys
4. **Monitor usage** - Check Twilio Console for unexpected charges
5. **Use environment-specific accounts** - Different accounts for dev/prod

## API Endpoint

The phone number generation endpoint is:

```
POST http://localhost:3000/api/channels/generate-phone-number
Content-Type: application/json

{
  "country": "USA"
}
```

**Response**:
```json
{
  "phoneNumber": "+15551234567",
  "countryCode": "+1",
  "isoCountry": "US",
  "capabilities": {
    "voice": true,
    "sms": true,
    "mms": true
  },
  "isMock": false,
  "twilioSid": "PNxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "message": "Phone number purchased successfully"
}
```

## Additional Resources

- [Twilio Console](https://console.twilio.com/)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Phone Number Pricing](https://www.twilio.com/phone-numbers/pricing)
- [Country Support](https://www.twilio.com/docs/phone-numbers/international-catalog)

## Need Help?

- Check the server logs: `server/logs/combined.log`
- Twilio Support: https://support.twilio.com/
- Application Issues: Open an issue in the repository

---

**Happy Coding!** 🚀

