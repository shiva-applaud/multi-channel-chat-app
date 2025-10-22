const logger = require('../../utils/logger');
const IMessagingProvider = require('./IMessagingProvider');
const crypto = require('crypto');

/**
 * AWSProvider - AWS implementation of IMessagingProvider
 * Handles SMS via AWS SNS and WhatsApp via AWS End User Messaging Social
 */
class AWSProvider extends IMessagingProvider {
  constructor() {
    super();
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.smsSenderId = process.env.AWS_SNS_SMS_SENDER_ID;
    this.whatsappPhoneNumberId = process.env.AWS_WHATSAPP_PHONE_NUMBER_ID;
    this.whatsappBusinessAccountId = process.env.AWS_WHATSAPP_BUSINESS_ACCOUNT_ID;
    
    this.snsClient = null;
    this.socialMessagingClient = null;
    this.smsConfigured = false;
    this.whatsappConfigured = false;

    this._initializeSNS();
    this._initializeWhatsApp();

    if (!this.smsConfigured && !this.whatsappConfigured) {
      logger.warn('AWS credentials not configured. All messaging will use mock mode.');
      logger.warn('To enable AWS messaging, set:');
      logger.warn('  - AWS_REGION');
      logger.warn('  - AWS_ACCESS_KEY_ID');
      logger.warn('  - AWS_SECRET_ACCESS_KEY');
      logger.warn('  - AWS_SNS_SMS_SENDER_ID (for SMS)');
      logger.warn('  - AWS_WHATSAPP_PHONE_NUMBER_ID (for WhatsApp)');
      logger.warn('  - AWS_WHATSAPP_BUSINESS_ACCOUNT_ID (for WhatsApp)');
    }
  }

  _initializeSNS() {
    if (this.accessKeyId && this.secretAccessKey) {
      try {
        const { SNSClient } = require('@aws-sdk/client-sns');
        this.snsClient = new SNSClient({
          region: this.region,
          credentials: {
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey
          }
        });
        this.smsConfigured = true;
        logger.info('AWS SNS client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize AWS SNS client:', error);
        logger.warn('Make sure @aws-sdk/client-sns is installed: npm install @aws-sdk/client-sns');
        this.smsConfigured = false;
      }
    }
  }

  _initializeWhatsApp() {
    if (this.accessKeyId && this.secretAccessKey && this.whatsappPhoneNumberId) {
      try {
        const { SocialMessagingClient } = require('@aws-sdk/client-socialmessaging');
        this.socialMessagingClient = new SocialMessagingClient({
          region: this.region,
          credentials: {
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey
          }
        });
        this.whatsappConfigured = true;
        logger.info('AWS Social Messaging client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize AWS Social Messaging client:', error);
        logger.warn('Make sure @aws-sdk/client-socialmessaging is installed: npm install @aws-sdk/client-socialmessaging');
        this.whatsappConfigured = false;
      }
    }
  }

  getProviderName() {
    return 'aws';
  }

  isSmsConfigured() {
    return this.smsConfigured && this.snsClient !== null;
  }

  isWhatsAppConfigured() {
    return this.whatsappConfigured && this.socialMessagingClient !== null;
  }

  getConfigurationStatus() {
    return {
      provider: 'aws',
      isSmsConfigured: this.smsConfigured,
      isWhatsAppConfigured: this.whatsappConfigured,
      hasSNSClient: this.snsClient !== null,
      hasSocialMessagingClient: this.socialMessagingClient !== null,
      hasCredentials: !!(this.accessKeyId && this.secretAccessKey),
      hasSmsSenderId: !!this.smsSenderId,
      hasWhatsAppPhoneNumberId: !!this.whatsappPhoneNumberId,
      hasWhatsAppBusinessAccountId: !!this.whatsappBusinessAccountId,
      region: this.region,
      smsSenderId: this.smsSenderId || 'Not set',
      whatsappPhoneNumberId: this.whatsappPhoneNumberId || 'Not set'
    };
  }

  async sendSMS(to, message, from = null) {
    try {
      if (!this.isSmsConfigured()) {
        logger.warn('AWS SNS not configured. Simulating SMS send.');
        return {
          sid: `AWS-SMS-${Date.now()}`,
          to,
          from: from || this.smsSenderId || 'AWS-SMS',
          body: message,
          status: 'queued',
          isMock: true
        };
      }

      const { PublishCommand } = require('@aws-sdk/client-sns');
      
      logger.info(`Sending SMS via AWS SNS to ${to}`);

      const params = {
        PhoneNumber: to,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: from || this.smsSenderId || 'AWS'
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };

      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);

      logger.info(`SMS sent successfully via AWS SNS. MessageId: ${response.MessageId}`);

      return {
        sid: response.MessageId,
        to,
        from: from || this.smsSenderId,
        body: message,
        status: 'sent',
        dateCreated: new Date(),
        isMock: false
      };
    } catch (error) {
      logger.error('Error sending SMS via AWS SNS:', error);
      throw error;
    }
  }

  async sendWhatsApp(to, message, from = null) {
    try {
      if (!this.isWhatsAppConfigured()) {
        logger.warn('AWS WhatsApp not configured. Simulating WhatsApp send.');
        return {
          sid: `AWS-WA-${Date.now()}`,
          to: `whatsapp:${to}`,
          from: `whatsapp:${from || this.whatsappPhoneNumberId || 'AWS-WhatsApp'}`,
          body: message,
          status: 'queued',
          isMock: true
        };
      }

      // AWS End User Messaging Social API for WhatsApp
      const { SendWhatsAppMessageCommand } = require('@aws-sdk/client-socialmessaging');

      // Clean phone number (remove whatsapp: prefix if present)
      const cleanTo = to.replace('whatsapp:', '');
      const cleanFrom = (from || this.whatsappPhoneNumberId).replace('whatsapp:', '');

      logger.info(`Sending WhatsApp message via AWS from ${cleanFrom} to ${cleanTo}`);

      const params = {
        phoneNumberId: cleanFrom,
        recipientPhoneNumber: cleanTo,
        messageType: 'TEXT',
        textContent: {
          body: message
        }
      };

      const command = new SendWhatsAppMessageCommand(params);
      const response = await this.socialMessagingClient.send(command);

      logger.info(`WhatsApp message sent successfully via AWS. MessageId: ${response.messageId}`);

      return {
        sid: response.messageId,
        to: `whatsapp:${cleanTo}`,
        from: `whatsapp:${cleanFrom}`,
        body: message,
        status: 'sent',
        dateCreated: new Date(),
        isMock: false
      };
    } catch (error) {
      logger.error('Error sending WhatsApp message via AWS:', error);
      
      // Handle AWS-specific errors
      if (error.name === 'InvalidParameterException') {
        throw new Error('Invalid phone number format for AWS WhatsApp');
      } else if (error.name === 'ResourceNotFoundException') {
        throw new Error('WhatsApp phone number ID not found in AWS');
      }
      
      throw error;
    }
  }

  validateWebhookSignature(req) {
    // AWS SNS webhook validation
    const messageType = req.headers['x-amz-sns-message-type'];
    
    if (!messageType) {
      logger.warn('AWS SNS webhook signature validation skipped (no message type header)');
      return process.env.NODE_ENV === 'development'; // Allow in development
    }

    try {
      // For SNS subscription confirmation
      if (messageType === 'SubscriptionConfirmation') {
        logger.info('AWS SNS subscription confirmation received');
        return true;
      }

      // For actual notifications, verify signature
      if (messageType === 'Notification') {
        const signature = req.headers['x-amz-sns-signature'];
        const signingCertUrl = req.headers['x-amz-sns-signing-cert-url'];
        
        if (!signature || !signingCertUrl) {
          logger.error('Missing AWS SNS signature or signing cert URL');
          return false;
        }

        // In production, you should verify the signature using the certificate
        // For now, we'll trust in development and log in production
        if (process.env.NODE_ENV === 'production') {
          logger.warn('AWS SNS signature verification not fully implemented. Implement certificate-based validation for production.');
        }
        
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error validating AWS webhook signature:', error);
      return false;
    }
  }

  parseIncomingWebhook(req, type) {
    const body = req.body;

    try {
      // Handle AWS SNS webhook format
      if (typeof body === 'string') {
        const parsed = JSON.parse(body);
        body = parsed;
      }

      // AWS SNS subscription confirmation
      if (body.Type === 'SubscriptionConfirmation') {
        logger.info('AWS SNS subscription confirmation', {
          subscribeUrl: body.SubscribeURL,
          topic: body.TopicArn
        });
        return {
          type: 'subscription_confirmation',
          subscribeUrl: body.SubscribeURL,
          topic: body.TopicArn
        };
      }

      // AWS SNS notification
      if (body.Type === 'Notification' && body.Message) {
        const message = typeof body.Message === 'string' ? JSON.parse(body.Message) : body.Message;
        
        if (type === 'sms') {
          return {
            from: message.originationNumber || message.from,
            to: message.destinationNumber || message.to,
            body: message.messageBody || message.body || '',
            messageSid: message.messageId || body.MessageId,
            numMedia: 0,
            mediaUrls: [],
            timestamp: message.timestamp || body.Timestamp
          };
        } else if (type === 'whatsapp') {
          return {
            from: message.from || message.sender,
            to: message.to || message.recipient,
            body: message.text?.body || message.body || '',
            messageSid: message.id || message.messageId,
            numMedia: message.media ? 1 : 0,
            mediaUrls: message.media ? [message.media.url] : [],
            timestamp: message.timestamp,
            profileName: message.profile?.name
          };
        }
      }

      throw new Error('Unsupported AWS webhook format');
    } catch (error) {
      logger.error('Error parsing AWS webhook:', error);
      throw error;
    }
  }

  // AWS-specific helper methods

  async confirmSNSSubscription(subscribeUrl) {
    try {
      const https = require('https');
      
      return new Promise((resolve, reject) => {
        https.get(subscribeUrl, (res) => {
          if (res.statusCode === 200) {
            logger.info('AWS SNS subscription confirmed successfully');
            resolve(true);
          } else {
            logger.error(`Failed to confirm AWS SNS subscription: ${res.statusCode}`);
            reject(new Error(`Subscription confirmation failed: ${res.statusCode}`));
          }
        }).on('error', (error) => {
          logger.error('Error confirming AWS SNS subscription:', error);
          reject(error);
        });
      });
    } catch (error) {
      logger.error('Error in confirmSNSSubscription:', error);
      throw error;
    }
  }

  async getSMSQuota() {
    if (!this.isSmsConfigured()) {
      return null;
    }

    try {
      const { GetSMSAttributesCommand } = require('@aws-sdk/client-sns');
      const command = new GetSMSAttributesCommand({
        attributes: ['MonthlySpendLimit']
      });
      const response = await this.snsClient.send(command);
      return response.attributes;
    } catch (error) {
      logger.error('Error getting SMS quota:', error);
      return null;
    }
  }
}

module.exports = AWSProvider;

