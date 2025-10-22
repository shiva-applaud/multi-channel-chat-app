const logger = require('../utils/logger');
const axios = require('axios');

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
      throw error;
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
}

module.exports = new AIResponseService();

