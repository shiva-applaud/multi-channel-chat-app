const logger = require('../utils/logger');
const axios = require('axios');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Channel = require('../models/Channel');
const twilioService = require('./twilioService');

/**
 * AI Response Service
 * Generates automated responses to user messages
 * Can be extended to integrate with OpenAI, Anthropic, or other AI APIs
 */

class AIResponseService {
  constructor() {
    this.isEnabled = process.env.AI_RESPONSES_ENABLED === 'true' || false;
    this.responseDelay = parseInt(process.env.AI_RESPONSE_DELAY) || 2000; // 2 seconds default
    this.aiProvider = process.env.AI_PROVIDER || 'mock'; // 'mock', 'openai', 'anthropic'
  }

  /**
   * Generate an AI response based on user message
   * @param {string} userMessage - The message from the user
   * @param {string} communicationType - whatsapp, sms, or voice
   * @returns {Promise<string>} - AI generated response
   */
  async generateResponse(session_id = '123', userMessage, communicationType = 'whatsapp') {
    if (!this.isEnabled) {
      return null;
    }

    logger.info(`Generating AI response for message: "${userMessage}"`);

    // Simulate AI thinking time
    await this.delay(this.responseDelay);

    switch (this.aiProvider) {
      case 'openai':
        return await this.generateOpenAIResponse(userMessage);
      case 'anthropic':
        return await this.generateAnthropicResponse(userMessage);
      case 'mock':
        return this.callExternalChatAPI(session_id, userMessage, communicationType);
      default:
        return this.generateMockResponse(userMessage, communicationType);
    }
  }

  /**
   * Generate a mock response (for testing/demo purposes)
   */
  generateMockResponse(userMessage, communicationType) {
    const messageLower = userMessage.toLowerCase();

    // Greeting responses
    if (messageLower.match(/\b(hi|hello|hey|greetings)\b/)) {
      const greetings = [
        'Hello! How can I assist you today?',
        'Hi there! What can I help you with?',
        'Hey! Great to hear from you. What do you need?',
        'Hello! I\'m here to help. What\'s on your mind?'
      ];
      return this.randomChoice(greetings);
    }

    // Question responses
    if (messageLower.includes('?')) {
      const questionResponses = [
        'That\'s a great question! Let me help you with that.',
        'I understand your question. Here\'s what I can tell you...',
        'Good question! Based on what you\'re asking...',
        'Let me answer that for you.'
      ];
      return this.randomChoice(questionResponses);
    }

    // Help requests
    if (messageLower.match(/\b(help|support|assist)\b/)) {
      return 'I\'m here to help! You can ask me questions about our services, check order status, or get general information. What would you like to know?';
    }

    // Thank you responses
    if (messageLower.match(/\b(thank|thanks|thx)\b/)) {
      const thankYouResponses = [
        'You\'re welcome! Is there anything else I can help with?',
        'Happy to help! Let me know if you need anything else.',
        'My pleasure! Feel free to reach out anytime.',
        'Glad I could help! Have a great day!'
      ];
      return this.randomChoice(thankYouResponses);
    }

    // Goodbye responses
    if (messageLower.match(/\b(bye|goodbye|see you|later)\b/)) {
      const goodbyeResponses = [
        'Goodbye! Have a wonderful day!',
        'See you later! Take care!',
        'Bye! Feel free to message anytime.',
        'Have a great day! Talk to you soon!'
      ];
      return this.randomChoice(goodbyeResponses);
    }

    // Information requests
    if (messageLower.match(/\b(what|when|where|how|why|who)\b/)) {
      const infoResponses = [
        'Let me provide you with that information...',
        'Based on your inquiry, here\'s what I found...',
        'That\'s a good question. Here\'s the answer...',
        'I can help you with that. Here\'s what you need to know...'
      ];
      return this.randomChoice(infoResponses);
    }

    // Order/booking related
    if (messageLower.match(/\b(order|booking|reservation|purchase)\b/)) {
      return 'I can help you with that! Could you provide me with your order number or more details?';
    }

    // Default responses
    const defaultResponses = [
      'Thanks for your message! I\'m here to assist you.',
      'I received your message. How can I help you today?',
      'Got it! Is there anything specific you\'d like to know?',
      'Thanks for reaching out! What would you like to discuss?',
      'I\'m listening! What can I do for you?'
    ];

    return this.randomChoice(defaultResponses);
  }

  /**
   * Generate response using OpenAI API (placeholder)
   * To implement: npm install openai, add OPENAI_API_KEY to .env
   */
  async generateOpenAIResponse(userMessage) {
    logger.info('OpenAI integration not yet implemented');
    // TODO: Implement OpenAI API integration
    // const { Configuration, OpenAIApi } = require('openai');
    // const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    // const openai = new OpenAIApi(configuration);
    // const response = await openai.createChatCompletion({ ... });
    return this.generateMockResponse(userMessage);
  }

  /**
   * Generate response using Anthropic Claude API (placeholder)
   * To implement: npm install @anthropic-ai/sdk, add ANTHROPIC_API_KEY to .env
   */
  async generateAnthropicResponse(userMessage) {
    logger.info('Anthropic integration not yet implemented');
    // TODO: Implement Anthropic API integration
    return this.generateMockResponse(userMessage);
  }

  /**
   * Call external chat API
   * @param {string} sessionId - The session ID
   * @param {string} message - The incoming message
   * @returns {Promise<string>} - AI reply text
   */
  async callExternalChatAPI(sessionId, message, communicationType) {
    try {
      logger.info(`Calling external chat API for session: ${sessionId} `);
      logger.info(`Communication type: ${communicationType}`);
      logger.info(`Message: ${message}`);
      logger.info(`session_id: ${sessionId}`);
      if(typeof sessionId === 'object' && sessionId._id) {
        sessionId = sessionId._id.toString();
      }
      
      logger.info('req body', JSON.stringify({
        actor_id: '123434tdfg423234',
        session_id: sessionId,
        message: message,
        enable_tools: false
      }));
      
      const response = await axios.post('http://127.0.0.1:8100/chat', {
        actor_id: '123434tdfg423234',
        session_id: sessionId,
        message: message,
        enable_tools: false
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      logger.info(`External chat API response received for session: ${sessionId}`);
      // Avoid circular structure by only logging safe parts
      try {
        logger.info(`Response status: ${response.status}`);
        logger.info(`Response data: ${JSON.stringify(response.data)}`);
      } catch (logErr) {
        logger.warn('Failed to serialize external API response for logging');
      }

      // Normalize to a string reply for downstream consumers
      const data = response && response.data !== undefined ? response.data : null;
      let reply = '';
      if (typeof data === 'string') {
        reply = data;
      } else if (data && typeof data.reply === 'string') {
        reply = data.reply;
      } else if (data && typeof data.message === 'string') {
        reply = data.message;
      } else if (data && typeof data.text === 'string') {
        reply = data.text;
      } else if (typeof data !== 'string') {
        logger.warn('No valid content found in API response, using fallback');
        return this.generateMockResponse(message, communicationType);
      } else {
        reply = JSON.stringify(data);
      }

      return reply;
    } catch (error) {
      logger.error(`Error calling external chat API: ${error.message}`);
      if (error.response) {
        logger.error(`API responded with status: ${error.response.status}`);
        logger.error(`API error data: ${JSON.stringify(error.response.data)}`);
      }
      return this.generateMockResponse(message, communicationType);
      // throw error;
    }
  }

  /**
   * Delay utility for simulating AI thinking time
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get random choice from array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Check if AI responses are enabled
   */
  isAIEnabled() {
    return this.isEnabled;
  }

  /**
   * Enable AI responses
   */
  enable() {
    this.isEnabled = true;
    logger.info('AI responses enabled');
  }

  /**
   * Disable AI responses
   */
  disable() {
    this.isEnabled = false;
    logger.info('AI responses disabled');
  }

  /**
   * Generate and save AI response asynchronously
   * This function handles the complete flow of generating AI responses,
   * saving them to the database, and sending them via Twilio
   * 
   * @param {string|Object} channel_id - Channel ID or Channel object
   * @param {string|Object} session_id - Session ID or Session object
   * @param {string} userMessageContent - User's message content
   * @param {string} communication_type - Communication type (sms, whatsapp, etc.)
   * @param {Object} io - Socket.IO instance for real-time updates
   * @param {Object} args - Additional arguments
   */
  async generateAndSaveAIResponse(channel_id, session_id, userMessageContent, communication_type, io, args) {
    try {
      logger.info('Generating AI response...');
      
      // Generate AI response
      const aiContent = await this.generateResponse(session_id, userMessageContent, communication_type);
      logger.info(`AI content: ${aiContent}`);
      if (!aiContent || aiContent === 'undefined' || aiContent.trim() === '') {
        logger.info('AI responses disabled or no valid response generated');
        return;
      }
      
      // Handle channel - can be object or ID string
      let channel;
      let channelId;
      if (typeof channel_id === 'object' && channel_id._id) {
        // Channel object passed
        channel = channel_id;
        channelId = channel._id.toString();
      } else {
        // Channel ID string passed
        channelId = channel_id;
        if (args.channel) {
          channel = args.channel;
        } else {
          channel = await Channel.findById(channel_id);
          if (!channel) {
            logger.warn(`Channel not found for AI response, creating new channel for ID: ${channel_id}`);
            
            // Create a new channel with the given channel_id
            const newChannel = new Channel({
              _id: channel_id, // Use the given channel_id as the document _id
              name: `Auto-created channel for ${channel_id}`,
              phone_number: `+${channel_id}`, // Use channel_id as phone number
              country_code: 'Unknown',
              type: 'whatsapp',
              status: 'active',
              twilio_sid: null
            });
            
            try {
              await newChannel.save();
              logger.info(`New channel created with ID: ${newChannel._id} for channel_id: ${channel_id}`);
              channel = newChannel; // Use the newly created channel
            } catch (error) {
              logger.error(`Failed to create new channel for ${channel_id}:`, error);
              return;
            }
          }
        }
      }
      
      // Handle session - can be object or ID string
      let sessionId;
      if (typeof session_id === 'object' && session_id._id) {
        // Session object passed
        sessionId = session_id._id.toString();
      } else {
        // Session ID string passed
        sessionId = session_id;
        if (args.session) {
          session = args.session;
        } else {
          session = await Session.findById(session_id);
          if (!session) {
            logger.warn(`Session not found for AI response, creating new session for ID: ${session_id}`);
          }
        }
      }
      
      // Get user's phone number from the most recent user message in this session
      let userPhoneNumber;
      if (args.incomingMessage) {
        userPhoneNumber = args.incomingMessage.metadata.fromNumber;
      } else {
        const recentUserMessage = await Message.findOne({
          session_id: sessionId,
          sender: 'user'
        }).sort({ createdAt: -1 });
        logger.info(`Recent user message: ${JSON.stringify(recentUserMessage)}`);
        userPhoneNumber = recentUserMessage?.metadata?.fromNumber;
      }
      
      // Save AI message to MongoDB
      const aiMessage = new Message({
        channel_id: channelId,
        session_id: sessionId,
        content: aiContent,
        sender: 'contact', // AI responds as 'contact'
        type: 'text',
        communication_type: communication_type || 'whatsapp', // Default to 'whatsapp' instead of null
        status: 'sent'
      });
      
      await aiMessage.save();
      logger.info(`AI message saved to DB: ${aiMessage._id} in session ${session_id}`);
      
      // Send AI response via Twilio FROM Twilio number TO user's number
      if (userPhoneNumber && channel.phone_number) {
        try {
          if (communication_type === 'sms') {
            logger.info(`📤 Sending AI SMS FROM ${channel.phone_number} TO ${userPhoneNumber}`);
            const result = await twilioService.sendSMS(
              userPhoneNumber,        // TO: User's number
              aiContent,              // AI response content
              channel.phone_number    // FROM: Twilio number
            );
            logger.info(`✅ AI SMS sent via Twilio: ${result.sid || (result.isMock ? 'mock' : 'unknown')}`);
          } 
          else if (communication_type === 'whatsapp') {
            logger.info(`📤 Sending AI WhatsApp FROM ${channel.phone_number} TO ${userPhoneNumber}`);
            const result = await twilioService.sendWhatsApp(
              userPhoneNumber,        // TO: User's number
              aiContent,
              channel.phone_number    // FROM: Twilio number
            );
            logger.info(`✅ AI WhatsApp sent via Twilio: ${result.sid || (result.isMock ? 'mock' : 'unknown')}`);
          }
          
          // Store metadata
          aiMessage.metadata = {
            fromNumber: channel.phone_number,
            toNumber: userPhoneNumber,
            sentViaTwitter: true,
            direction: 'outgoing'
          };
          await aiMessage.save();
          
        } catch (twilioError) {
          logger.error(`❌ Failed to send AI response via Twilio:`, twilioError);
          
          // Check if it's an authentication error
          if (twilioError.message === 'Authenticate' || twilioError.message.includes('Authentication')) {
            logger.error('🔐 Twilio authentication failed. Please check your credentials:');
            logger.error('   - TWILIO_ACCOUNT_SID');
            logger.error('   - TWILIO_SMS_AUTH_TOKEN');
            logger.error('   - TWILIO_WHATSAPP_NUMBER (for WhatsApp)');
            logger.error('   - TWILIO_PHONE_NUMBER (for SMS)');
          }
          
          // Continue - message is already saved in DB
        }
      } else {
        logger.warn('Cannot send AI response via Twilio: missing user phone number or Twilio number');
      }
      
      // Update session
      await Session.findByIdAndUpdate(sessionId, {
        $inc: { message_count: 1 },
        last_message_at: new Date()
      });
      
      // Transform AI message for frontend
      const aiMessageResponse = {
        id: aiMessage._id.toString(),
        channel_id: aiMessage.channel_id,
        session_id: aiMessage.session_id,
        content: aiMessage.content,
        sender: aiMessage.sender,
        type: aiMessage.type,
        communication_type: aiMessage.communication_type,
        status: aiMessage.status,
        created_at: aiMessage.createdAt.toISOString()
      };
      
      // Emit AI message to connected clients
      io.to(channel_id).emit('new_message', aiMessageResponse);
      logger.info('AI response sent to clients via Socket.IO');
    } catch (error) {
      logger.error('Error in generateAndSaveAIResponse:', error);
    }
  }
}

module.exports = new AIResponseService();

