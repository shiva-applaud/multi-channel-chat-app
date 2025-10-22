# AWS Messaging Provider Setup Guide

This guide explains how to configure and use AWS messaging services (AWS SNS for SMS and AWS End User Messaging Social for WhatsApp) as an alternative to Twilio in the multi-channel chat application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [AWS SNS Setup (SMS)](#aws-sns-setup-sms)
- [AWS WhatsApp Setup](#aws-whatsapp-setup)
- [Webhook Configuration](#webhook-configuration)
- [Switching Between Providers](#switching-between-providers)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The application now supports two messaging providers:
- **Twilio** (default): Original provider for SMS, WhatsApp, and Voice
- **AWS**: AWS SNS for SMS and AWS End User Messaging Social for WhatsApp

Both providers implement the same interface, allowing seamless switching via environment variables without code changes.

## Prerequisites

### AWS Account Setup

1. **Create an AWS Account**
   - Go to https://aws.amazon.com/ and create an account
   - Complete identity verification

2. **Create IAM User for API Access**
   - Navigate to IAM → Users → Create User
   - Enable "Programmatic access"
   - Attach policies:
     - `AmazonSNSFullAccess` (for SMS)
     - `AWSEndUserMessagingSocialFullAccess` (for WhatsApp)
   - Save the Access Key ID and Secret Access Key

3. **Enable SMS in AWS SNS**
   - Go to SNS → Text messaging (SMS) → Sandbox
   - Request production access if needed
   - Configure SMS preferences (sender ID, spend limit)

4. **Set Up WhatsApp Business (if using WhatsApp)**
   - Register with WhatsApp Business API
   - Connect to AWS End User Messaging Social
   - Get Phone Number ID and Business Account ID

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Messaging Provider Selection
MESSAGING_PROVIDER=aws  # Options: 'twilio' or 'aws' (default: twilio)

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# AWS SNS (SMS)
AWS_SNS_SMS_SENDER_ID=YourAppName  # Sender ID shown to recipients

# AWS WhatsApp (if using WhatsApp)
AWS_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
AWS_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Server URL (for webhooks)
SERVER_URL=https://your-domain.com
```

### Install Dependencies

```bash
cd server
npm install
```

The following AWS SDK packages will be installed:
- `@aws-sdk/client-sns` (for SMS)
- `@aws-sdk/client-socialmessaging` (for WhatsApp)

## AWS SNS Setup (SMS)

### 1. Configure SNS for SMS

```bash
# In AWS Console:
1. Go to Amazon SNS
2. Navigate to Text messaging (SMS)
3. Configure SMS preferences:
   - Default message type: Transactional
   - Default sender ID: YourAppName
   - Account spend limit: Set appropriate limit
```

### 2. Add Phone Number to Sandbox (for testing)

If in sandbox mode:
```bash
1. Go to SNS → Text messaging (SMS) → Sandbox destination phone numbers
2. Add test phone numbers
3. Verify them via code
```

### 3. Request Production Access

For production use:
```bash
1. Go to SNS → Text messaging (SMS) → Sandbox destination phone numbers
2. Click "Exit sandbox"
3. Fill out the request form
4. Wait for approval (typically 24 hours)
```

### 4. Set Up Webhook for Incoming SMS

```bash
1. Create an SNS Topic:
   - Go to SNS → Topics → Create topic
   - Name: multi-channel-chat-sms
   - Type: Standard

2. Create Subscription:
   - Protocol: HTTPS
   - Endpoint: https://your-domain.com/api/webhooks/aws-sns
   - Click "Create subscription"

3. Confirm Subscription:
   - AWS will POST to your webhook with SubscribeURL
   - The app automatically confirms subscriptions
   - Check logs for confirmation
```

## AWS WhatsApp Setup

### 1. Register WhatsApp Business Account

```bash
1. Go to Facebook Business Manager
2. Create/link WhatsApp Business Account
3. Complete business verification
```

### 2. Connect to AWS End User Messaging Social

```bash
1. In AWS Console:
   - Go to AWS End User Messaging Social
   - Click "Connect WhatsApp"

2. Link Facebook Business Account:
   - Authorize AWS access
   - Select WhatsApp Business Account
   - Choose phone number

3. Get Configuration Details:
   - Phone Number ID: Found in AWS console
   - Business Account ID: From Facebook Business Manager
```

### 3. Configure Webhooks

```bash
1. In AWS End User Messaging Social:
   - Go to Webhooks
   - Add webhook URL: https://your-domain.com/api/webhooks/aws-whatsapp
   - Subscribe to events: messages, message_status

2. Verify webhook:
   - AWS sends verification request
   - App responds automatically
```

## Webhook Configuration

### Webhook Endpoints

The application provides the following webhook endpoints:

```
# Twilio webhooks (original)
POST /api/webhooks/sms          # Twilio SMS
POST /api/webhooks/whatsapp     # Twilio WhatsApp
POST /api/webhooks/voice        # Twilio Voice

# AWS webhooks (new)
POST /api/webhooks/aws-sns      # AWS SNS (SMS)
POST /api/webhooks/aws-whatsapp # AWS WhatsApp

# Status endpoints
GET  /api/webhooks              # List all webhooks
POST /api/webhooks/status       # Webhook status callback
```

### Webhook Signature Validation

Both providers support webhook signature validation:

```javascript
// Automatically validates based on provider
// Twilio: Validates X-Twilio-Signature header
// AWS: Validates SNS message signature

// To enable validation, uncomment in webhooks.js:
if (!validateWebhookSignature(req)) {
  return res.status(403).send('Forbidden');
}
```

## Switching Between Providers

### Using Twilio (Default)

```bash
# .env
MESSAGING_PROVIDER=twilio
# OR omit MESSAGING_PROVIDER entirely

# Twilio credentials
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_SMS_AUTH_TOKEN=your_sms_auth_token
TWILIO_WHATSAPP_AUTH_TOKEN=your_whatsapp_auth_token
```

### Using AWS

```bash
# .env
MESSAGING_PROVIDER=aws

# AWS credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SNS_SMS_SENDER_ID=YourApp
```

### Runtime Switching

```bash
# Stop the server
Ctrl+C

# Change .env
MESSAGING_PROVIDER=aws

# Restart the server
npm run dev

# Check logs to confirm provider
# Output: "Initializing messaging provider: aws"
```

## Testing

### Test SMS via AWS SNS

```bash
# Method 1: Using curl
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "your_channel_id",
    "session_id": "your_session_id",
    "content": "Test SMS via AWS",
    "sender": "user",
    "type": "text",
    "communication_type": "sms",
    "recipient_number": "+1234567890"
  }'

# Method 2: Using the web interface
# 1. Open http://localhost:8080
# 2. Select a channel
# 3. Send message with communication_type: SMS
```

### Test WhatsApp via AWS

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "your_channel_id",
    "session_id": "your_session_id",
    "content": "Test WhatsApp via AWS",
    "sender": "user",
    "type": "text",
    "communication_type": "whatsapp",
    "recipient_number": "+1234567890"
  }'
```

### Verify Provider Configuration

```bash
# Check provider status
curl http://localhost:3000/api/webhooks

# Check logs
tail -f server/logs/combined.log

# Look for:
# "Initializing messaging provider: aws"
# "AWS SNS client initialized successfully"
# "Provider configuration: { provider: 'aws', ... }"
```

## Troubleshooting

### Common Issues

#### 1. AWS SDK Not Installed

**Error**: `Cannot find module '@aws-sdk/client-sns'`

**Solution**:
```bash
cd server
npm install
```

#### 2. Invalid AWS Credentials

**Error**: `The security token included in the request is invalid`

**Solution**:
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check IAM user has necessary permissions
- Ensure credentials haven't expired

#### 3. SMS Not Sending

**Error**: `SMS quota exceeded` or `Phone number not verified`

**Solution**:
- Check if in SNS sandbox mode (limits to verified numbers)
- Request production access via SNS console
- Verify recipient numbers in sandbox

#### 4. WhatsApp Not Configured

**Error**: `AWS WhatsApp not configured. Simulating WhatsApp send.`

**Solution**:
- Verify AWS_WHATSAPP_PHONE_NUMBER_ID is set
- Check AWS End User Messaging Social setup
- Ensure WhatsApp Business account is linked

#### 5. Webhook Not Receiving Messages

**Error**: No incoming messages in app

**Solution**:
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check SNS subscription status (should be "Confirmed")
- Review AWS CloudWatch logs
- Check application logs for webhook errors

### Enable Debug Logging

```bash
# Add to .env
NODE_ENV=development
LOG_LEVEL=debug

# Restart server
npm run dev

# All webhook data will be logged
```

### Test Webhook Locally

```bash
# Use ngrok to expose local server
npx ngrok http 3000

# Update webhook URL in AWS Console
# Example: https://abc123.ngrok.io/api/webhooks/aws-sns

# Send test message from phone
# Check logs for incoming webhook
```

## Cost Considerations

### AWS SNS Pricing (as of 2024)

- **SMS**: $0.00645 per message (US)
- **Data transfer**: Minimal costs
- **Free tier**: 100 SMS per month

### AWS WhatsApp Pricing

- **Per message**: Variable by country
- **Business-initiated**: ~$0.005-0.02 per message
- **User-initiated (first 1,000/month)**: Free
- Consult AWS pricing for your region

### Comparison with Twilio

| Feature | Twilio | AWS SNS |
|---------|--------|---------|
| SMS (US) | $0.0079/msg | $0.00645/msg |
| WhatsApp | $0.005-0.02/msg | $0.005-0.02/msg |
| Setup complexity | Low | Medium |
| Free tier | Trial credits | 100 SMS/mo |

## Additional Resources

- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [AWS End User Messaging Social](https://docs.aws.amazon.com/social-messaging/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

## Support

For issues specific to:
- **AWS Setup**: Contact AWS Support
- **Application Issues**: Check application logs and GitHub issues
- **WhatsApp Business**: Contact Facebook Business Support

