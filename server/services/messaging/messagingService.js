const logger = require('../../utils/logger');
const twilioService = require('../twilioService');
const Channel = require('../../models/Channel');

/**
 * MessagingService - Handles multi-channel messaging (SMS, WhatsApp, Voice)
 * 
 * This service provides a unified interface for sending messages across different
 * communication channels through Twilio's APIs. It supports SMS, WhatsApp, and Voice calls.
 * 
 * @class MessagingService
 * @example
 * const messagingService = require('./messagingService');
 * 
 * // Send WhatsApp message
 * await messagingService.sendMessage(channelId, 'Hello!', 'whatsapp', '+1234567890');
 * 
 * // Send SMS message  
 * await messagingService.sendMessage(channelId, 'Hello!', 'sms', '+1234567890');
 */
class MessagingService {
  constructor() {
    this.mockMode = process.env.MOCK_MODE === 'true';
  }

  /**
   * Send a message through the specified channel
   * 
   * This is the main entry point for sending messages. It routes the message
   * to the appropriate channel handler (WhatsApp, SMS, or Voice).
   * 
   * @param {string} channelId - MongoDB ObjectId of the channel
   * @param {string} content - Message content to send
   * @param {string} type - Channel type: 'whatsapp', 'sms', or 'voice'
   * @param {string} recipientNumber - Recipient's phone number with country code
   * @returns {Promise<Object>} - Result object with success status and message details
   * 
   * @example
   * // Send WhatsApp message
   * const result = await messagingService.sendMessage(
   *   '507f1f77bcf86cd799439011', 
   *   'Hello from WhatsApp!', 
   *   'whatsapp', 
   *   '+1234567890'
   * );
   * 
   * @throws {Error} When channel not found or unsupported channel type
   */
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

  /**
   * Send a WhatsApp message via Twilio
   * 
   * This method handles WhatsApp messaging through Twilio's WhatsApp Business API.
   * Supports both sandbox and production environments.
   * 
   * @param {Object} channel - Channel object containing phone_number
   * @param {string} content - Message content to send
   * @param {string} recipientNumber - Recipient's phone number with country code
   * @returns {Promise<Object>} - Result object with success status and message details
   * 
   * @example
   * // Send WhatsApp message
   * const result = await messagingService.sendWhatsAppMessage(channel, 'Hello!', '+1234567890');
   * console.log('Message sent:', result.success);
   */
  async sendWhatsAppMessage(channel, content, recipientNumber) {
    logger.info(`Sending WhatsApp message from ${channel.phone_number} to ${recipientNumber}`);
    
    try {
      // Use WhatsApp-specific number if available, otherwise use channel number
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || channel.phone_number || process.env.TWILIO_PHONE_NUMBER;
      
      // Use Twilio service to send WhatsApp message to the recipient
      const result = await twilioService.sendWhatsApp(
        recipientNumber, // Send TO recipient
        content,
        fromNumber // FROM WhatsApp number
      );
      
      logger.info(`WhatsApp message sent: ${result.sid || 'mock'}, isMock: ${result.isMock || false}`);
      
      return { 
        success: true, 
        messageId: result.sid, 
        status: result.status,
        isMock: result.isMock || false,
        from: result.from,
        to: result.to
      };
    } catch (error) {
      logger.error('WhatsApp send error:', error);
      
      // Enhanced error handling for WhatsApp-specific issues
      if (error.message.includes('Invalid phone number format')) {
        throw new Error('Invalid recipient number format. Please include country code (e.g., +1234567890)');
      } else if (error.message.includes('Recipient must join the WhatsApp sandbox')) {
        throw new Error('Recipient must join the WhatsApp sandbox first. Send "join <sandbox-code>" to +1 415 523 8886');
      } else if (error.message.includes('Invalid WhatsApp number')) {
        throw new Error('Invalid WhatsApp number. Please verify the recipient number.');
      }
      
      throw error;
    }
  }

  /**
   * Send an SMS message via Twilio
   * 
   * This method handles SMS messaging through Twilio's SMS API.
   * Supports both sandbox and production environments.
   * 
   * @param {Object} channel - Channel object containing phone_number
   * @param {string} content - Message content to send
   * @param {string} recipientNumber - Recipient's phone number with country code
   * @returns {Promise<Object>} - Result object with success status and message details
   * 
   * @example
   * // Send SMS message
   * const result = await messagingService.sendSMSMessage(channel, 'Hello!', '+1234567890');
   * console.log('SMS sent:', result.success);
   */
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

  /**
   * Send WhatsApp message via Twilio
   * 
   * This method handles WhatsApp messaging through Twilio's WhatsApp API.
   * Requires a verified WhatsApp Business number and proper webhook configuration.
   * 
   * @param {Object} channel - Channel object containing phone_number
   * @param {string} content - Message content to send
   * @param {string} recipientNumber - Recipient's WhatsApp number with country code
   * @returns {Promise<Object>} - Result object with success status and message details
   * 
   * @example
   * // Send WhatsApp message
   * const result = await messagingService.sendWhatsAppMessage(channel, 'Hello!', '+1234567890');
   * console.log('WhatsApp sent:', result.success);
   */
  async sendWhatsAppMessage(channel, content, recipientNumber) {
    logger.info(`Sending WhatsApp from ${channel.phone_number} to ${recipientNumber}`);
    
    try {
      // Use Twilio service to send WhatsApp to the recipient
      const result = await twilioService.sendWhatsApp(
        recipientNumber, // Send TO recipient
        content,
        channel.phone_number || process.env.TWILIO_PHONE_NUMBER // FROM channel number
      );
      
      logger.info(`WhatsApp sent: ${result.sid || 'mock'}, isMock: ${result.isMock || false}`);
      
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

  /**
   * Make a voice call via Twilio
   * 
   * This method handles voice calls through Twilio's Voice API.
   * Uses TwiML to provide the call content and instructions.
   * 
   * @param {Object} channel - Channel object containing phone_number
   * @param {string} content - Message content to speak during the call
   * @param {string} recipientNumber - Recipient's phone number with country code
   * @returns {Promise<Object>} - Result object with success status and call details
   * 
   * @example
   * // Make voice call
   * const result = await messagingService.makeVoiceCall(channel, 'Hello!', '+1234567890');
   * console.log('Call initiated:', result.success);
   */
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

