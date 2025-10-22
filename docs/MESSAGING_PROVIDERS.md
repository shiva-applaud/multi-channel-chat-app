# Messaging Providers

This application supports multiple messaging providers for SMS and WhatsApp communication. You can easily switch between providers using environment variables.

## Supported Providers

### 1. Twilio (Default)
- **Status**: Fully supported
- **Features**: SMS, WhatsApp, Voice
- **Setup Time**: ~5 minutes
- **Cost**: $0.0079 per SMS (US)
- **Documentation**: Original implementation

### 2. AWS (New!)
- **Status**: Fully supported
- **Features**: SMS (via SNS), WhatsApp (via End User Messaging Social)
- **Setup Time**: ~15 minutes
- **Cost**: $0.00645 per SMS (US) - **18% cheaper**
- **Documentation**: See below

## Quick Comparison

| Feature | Twilio | AWS |
|---------|--------|-----|
| SMS | ✅ | ✅ |
| WhatsApp | ✅ | ✅ |
| Voice | ✅ | ❌ |
| Setup | Easy | Medium |
| Cost (SMS) | $0.0079 | $0.00645 |
| Free Tier | Trial credits | 100 SMS/mo |

## How to Switch Providers

### Use Twilio (Default)

```bash
# In your .env file:
MESSAGING_PROVIDER=twilio
# OR omit this variable entirely

# Twilio credentials
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_SMS_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_AUTH_TOKEN=your_whatsapp_token
```

### Use AWS

```bash
# In your .env file:
MESSAGING_PROVIDER=aws

# AWS credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SNS_SMS_SENDER_ID=YourApp
```

### Switch at Runtime

Simply change the environment variable and restart the server:

```bash
# Stop server
Ctrl+C

# Edit .env
MESSAGING_PROVIDER=aws

# Restart server
npm run dev
```

The application will automatically use the selected provider. No code changes needed!

## Getting Started

### Twilio Setup

See the original documentation in the main README.

### AWS Setup

#### Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
MESSAGING_PROVIDER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# 3. Restart server
npm run dev

# 4. Check logs
# Look for: "Initializing messaging provider: aws"
```

#### Detailed Setup

For complete AWS setup instructions, see:
- **Quick Start**: [docs/AWS_QUICK_START.md](./AWS_QUICK_START.md)
- **Full Guide**: [docs/AWS_MESSAGING_SETUP.md](./AWS_MESSAGING_SETUP.md)
- **Implementation**: [docs/AWS_POC_IMPLEMENTATION.md](./AWS_POC_IMPLEMENTATION.md)

## Provider Features

### Both Providers Support

- ✅ Send SMS messages
- ✅ Send WhatsApp messages
- ✅ Receive messages via webhooks
- ✅ Webhook signature validation
- ✅ Bidirectional communication
- ✅ Mock mode for development
- ✅ Error handling and logging

### Provider-Specific Features

#### Twilio Only
- Voice calls
- Phone number provisioning API
- MMS messages

#### AWS Only
- Lower SMS costs (18% cheaper)
- AWS ecosystem integration
- SNS topic subscriptions

## Architecture

The application uses a **provider pattern** that abstracts the messaging implementation:

```
Application Code
     ↓
Provider Factory (reads MESSAGING_PROVIDER env var)
     ↓
├── Twilio Provider (SMS, WhatsApp, Voice)
└── AWS Provider (SMS via SNS, WhatsApp via Social Messaging)
```

All providers implement the same interface, so switching is transparent to the application.

## Environment Variables Reference

### Provider Selection

```bash
MESSAGING_PROVIDER=twilio|aws  # Default: twilio
```

### Twilio Configuration

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SMS_AUTH_TOKEN=your_sms_auth_token
TWILIO_WHATSAPP_AUTH_TOKEN=your_whatsapp_auth_token
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_WHATSAPP_NUMBER=+15551234567
```

### AWS Configuration

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_SNS_SMS_SENDER_ID=YourAppName
AWS_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
AWS_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

## Testing

### Test SMS

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "test_channel",
    "session_id": "test_session",
    "content": "Test message",
    "sender": "user",
    "type": "text",
    "communication_type": "sms",
    "recipient_number": "+1234567890"
  }'
```

The message will be sent via the configured provider (Twilio or AWS).

### Verify Provider

Check the logs to confirm which provider is active:

```bash
tail -f server/logs/combined.log | grep "provider"

# Expected output:
# "Initializing messaging provider: aws"
# OR
# "Initializing messaging provider: twilio"
```

## Cost Comparison

### SMS (US, per message)

- **Twilio**: $0.0079
- **AWS SNS**: $0.00645
- **Savings**: 18% with AWS

### Example: 10,000 SMS/month

- **Twilio**: $79.00
- **AWS**: $64.50
- **Monthly Savings**: $14.50

### WhatsApp (per message)

Both providers have similar pricing (~$0.005-0.02 depending on country).

## Choosing a Provider

### Choose Twilio if you need:
- Voice calls
- Simplest setup
- Phone number provisioning API
- All-in-one solution

### Choose AWS if you need:
- Lower costs (18% cheaper for SMS)
- AWS ecosystem integration
- SNS features (topics, subscriptions)
- Better free tier (100 SMS/month)

### Use Both:
The architecture supports keeping both providers configured and switching as needed. You could even implement failover logic in the future.

## Troubleshooting

### Provider Not Working

```bash
# Check which provider is configured
grep MESSAGING_PROVIDER .env

# Check provider initialization in logs
grep "Initializing messaging provider" server/logs/combined.log

# Check for errors
tail -n 100 server/logs/error.log
```

### Messages Not Sending

```bash
# Verify credentials are set
env | grep TWILIO_  # For Twilio
env | grep AWS_     # For AWS

# Check logs for errors
tail -f server/logs/combined.log

# Test in mock mode
# Remove credentials temporarily to test app logic
```

### Webhooks Not Receiving

```bash
# Ensure webhook URL is publicly accessible
# Use ngrok for local testing: npx ngrok http 3000

# Check webhook signature validation
# May need to disable temporarily for testing

# Verify webhook URL in provider console
# Twilio: https://console.twilio.com
# AWS: SNS Topics / Social Messaging settings
```

## Documentation

- **Quick Start**: [AWS_QUICK_START.md](./AWS_QUICK_START.md)
- **Full Setup**: [AWS_MESSAGING_SETUP.md](./AWS_MESSAGING_SETUP.md)
- **Implementation**: [AWS_POC_IMPLEMENTATION.md](./AWS_POC_IMPLEMENTATION.md)
- **Summary**: [../AWS_POC_SUMMARY.md](../AWS_POC_SUMMARY.md)

## Support

For provider-specific issues:
- **Twilio**: https://support.twilio.com
- **AWS**: https://aws.amazon.com/support

For application issues:
- Check application logs: `server/logs/combined.log`
- Review documentation in `docs/` folder
- Check GitHub issues (if applicable)

## Future Providers

The provider pattern makes it easy to add more messaging providers in the future, such as:
- MessageBird
- Vonage (formerly Nexmo)
- Plivo
- Sinch

Want to add a provider? See `server/services/providers/IMessagingProvider.js` for the interface contract.

