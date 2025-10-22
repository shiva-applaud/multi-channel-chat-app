# AWS Messaging Provider - Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Switch to AWS provider
MESSAGING_PROVIDER=aws

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# SMS Configuration
AWS_SNS_SMS_SENDER_ID=YourAppName

# WhatsApp Configuration (optional)
AWS_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
AWS_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 3. Start the Server

```bash
npm run dev
```

### 4. Verify Provider is Active

Check the logs for:
```
Initializing messaging provider: aws
AWS SNS client initialized successfully
```

### 5. Test SMS Sending

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "test_channel",
    "session_id": "test_session",
    "content": "Test message via AWS",
    "sender": "user",
    "type": "text",
    "communication_type": "sms",
    "recipient_number": "+1234567890"
  }'
```

## Switch Back to Twilio

```bash
# In .env
MESSAGING_PROVIDER=twilio

# Restart server
npm run dev
```

## That's It!

For detailed setup, see [AWS_MESSAGING_SETUP.md](./AWS_MESSAGING_SETUP.md)

## Common Commands

```bash
# View logs
tail -f server/logs/combined.log

# Check provider status
curl http://localhost:3000/api/webhooks

# Run in production
npm start
```

## Need Help?

1. **AWS Setup Issues**: See [AWS_MESSAGING_SETUP.md](./AWS_MESSAGING_SETUP.md)
2. **Implementation Details**: See [AWS_POC_IMPLEMENTATION.md](./AWS_POC_IMPLEMENTATION.md)
3. **Application Errors**: Check `server/logs/error.log`

## Provider Comparison

| Feature | Twilio | AWS |
|---------|--------|-----|
| Setup Time | 5 min | 15 min |
| Cost (SMS) | $0.0079 | $0.00645 |
| Free Tier | Trial credits | 100 SMS/mo |
| Complexity | Low | Medium |

## Key Environment Variables

```bash
# Provider Selection (default: twilio)
MESSAGING_PROVIDER=aws|twilio

# AWS (required for SMS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# AWS SMS
AWS_SNS_SMS_SENDER_ID=YourApp

# AWS WhatsApp (optional)
AWS_WHATSAPP_PHONE_NUMBER_ID=xxx
AWS_WHATSAPP_BUSINESS_ACCOUNT_ID=xxx
```

## Testing Checklist

- [ ] Install dependencies
- [ ] Add AWS credentials to .env
- [ ] Set MESSAGING_PROVIDER=aws
- [ ] Restart server
- [ ] Check logs for "AWS SNS client initialized"
- [ ] Send test SMS
- [ ] Verify message delivery
- [ ] Test webhook (if applicable)
- [ ] Switch back to Twilio
- [ ] Verify Twilio still works

## Production Deployment

```bash
# 1. Set production environment variables
export MESSAGING_PROVIDER=aws
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx

# 2. Build and start
npm run build
npm start

# 3. Configure webhooks in AWS Console
# SNS: https://your-domain.com/api/webhooks/aws-sns
# WhatsApp: https://your-domain.com/api/webhooks/aws-whatsapp
```

## Troubleshooting One-Liners

```bash
# Check which provider is active
grep "Initializing messaging provider" server/logs/combined.log | tail -1

# Check AWS credentials
env | grep AWS_

# Test AWS CLI access
aws sns list-topics --region us-east-1

# View recent errors
tail -n 50 server/logs/error.log

# Restart with clean logs
rm server/logs/*.log && npm run dev
```

## Quick Links

- [Full Setup Guide](./AWS_MESSAGING_SETUP.md)
- [Implementation Details](./AWS_POC_IMPLEMENTATION.md)
- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

