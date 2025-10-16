const logger = require('../../utils/logger');
const twilioService = require('../twilioService');
const Channel = require('../../models/Channel');

class MessagingService {
  constructor() {
    this.mockMode = process.env.MOCK_MODE === 'true';
  }

  async sendMessage(channelId, content, type, recipientNumber) {
    if (this.mockMode) {
      logger.info(`[MOCK] Sending ${type} message to ${recipientNumber || 'unknown'}: ${content}`);
      return { success: true, messageId: `mock_${Date.now()}` };
    }

    if (!recipientNumber) {
      throw new Error('Recipient number is required');
    }

    try {
      // Get channel details from MongoDB
      const channel = await Channel.findById(channelId);
      
      if (!channel) {
        throw new Error('Channel not found');
      }

      let result;
      switch (type || channel.type) {
        case 'whatsapp':
          result = await this.sendWhatsAppMessage(channel, content, recipientNumber);
          break;
        case 'sms':
          result = await this.sendSMSMessage(channel, content, recipientNumber);
          break;
        case 'voice':
          result = await this.makeVoiceCall(channel, content, recipientNumber);
          break;
        default:
          throw new Error(`Unsupported channel type: ${type || channel.type}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  async sendWhatsAppMessage(channel, content, recipientNumber) {
    logger.info(`Sending WhatsApp message from ${channel.phone_number} to ${recipientNumber}`);
    
    try {
      // Use Twilio service to send WhatsApp message to the recipient
      const result = await twilioService.sendWhatsApp(
        recipientNumber, // Send TO recipient
        content,
        channel.phone_number || process.env.TWILIO_PHONE_NUMBER // FROM channel number
      );
      
      logger.info(`WhatsApp message sent: ${result.sid || 'mock'}, isMock: ${result.isMock || false}`);
      
      return { 
        success: true, 
        messageId: result.sid, 
        status: result.status,
        isMock: result.isMock || false
      };
    } catch (error) {
      logger.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendSMSMessage(channel, content, recipientNumber) {
    logger.info(`Sending SMS from ${channel.phone_number} to ${recipientNumber}`);
    
    try {
      // Use Twilio service to send SMS to the recipient
      const result = await twilioService.sendSMS(
        recipientNumber, // Send TO recipient
        content,
        channel.phone_number || process.env.TWILIO_PHONE_NUMBER // FROM channel number
      );
      
      logger.info(`SMS sent: ${result.sid || 'mock'}, isMock: ${result.isMock || false}`);
      
      return { 
        success: true, 
        messageId: result.sid,
        status: result.status,
        isMock: result.isMock || false
      };
    } catch (error) {
      logger.error('SMS send error:', error);
      throw error;
    }
  }

  async makeVoiceCall(channel, content, recipientNumber) {
    logger.info(`Making voice call from ${channel.phone_number} to ${recipientNumber}`);
    
    try {
      // Create TwiML URL for voice call
      // In a real app, this would be a webhook URL that returns TwiML
      const twimlUrl = `http://twimlets.com/message?Message%5B0%5D=${encodeURIComponent(content)}`;
      
      // Use Twilio service to make call to the recipient
      const result = await twilioService.makeCall(
        recipientNumber, // Call TO recipient
        twimlUrl,
        channel.phone_number || process.env.TWILIO_PHONE_NUMBER // FROM channel number
      );
      
      logger.info(`Voice call initiated: ${result.sid || 'mock'}, isMock: ${result.isMock || false}`);
      
      return { 
        success: true, 
        callId: result.sid,
        status: result.status,
        isMock: result.isMock || false
      };
    } catch (error) {
      logger.error('Voice call error:', error);
      throw error;
    }
  }

  async receiveMessage(channelId, message) {
    logger.info(`Received message for channel ${channelId}:`, message);
    
    // Note: Message storage is now handled in the routes
    // This method is kept for backwards compatibility
    
    return { id: `received_${Date.now()}`, ...message };
  }
}

module.exports = new MessagingService();

