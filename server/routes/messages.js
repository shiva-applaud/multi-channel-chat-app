const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const messagingService = require('../services/messaging/messagingService');
const aiResponseService = require('../services/aiResponseService');
const twilioService = require('../services/twilioService');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Channel = require('../models/Channel');

// Get messages for a channel (optionally filter by session)
router.get('/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, offset = 0, session_id } = req.query;
    
    const filter = { channel_id: channelId };
    if (session_id) filter.session_id = session_id;
    
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();
    
    // Transform for frontend compatibility
    const transformedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      channel_id: msg.channel_id,
      session_id: msg.session_id,
      content: msg.content,
      sender: msg.sender,
      type: msg.type,
      communication_type: msg.communication_type,
      status: msg.status,
      created_at: msg.createdAt
    }));
    
    res.json(transformedMessages);
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const io = req.app.get('io');
    let { channel_id, session_id, content, sender, type = 'text', communication_type, user_phone_number, twilio_number } = req.body;
    
    if (!channel_id || !content || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // If no session_id provided, create or use the latest active session for this communication type
    if (!session_id) {
      let session = await Session.findOne({ 
        channel_id, 
        communication_type: communication_type || 'whatsapp',
        status: 'active' 
      }).sort({ last_message_at: -1 });
      
      if (!session) {
        // Create new session for this communication type
        const commType = communication_type || 'whatsapp';
        session = new Session({
          channel_id,
          communication_type: commType,
          title: undefined, // Let model default handle it
          status: 'active',
          message_count: 0
        });
        await session.save();
        logger.info(`New ${commType} session created automatically: ${session._id}`);
      }
      
      session_id = session._id.toString();
    }
    
    // Step 1: Create and save user message in MongoDB
    const userMessage = new Message({
      channel_id,
      session_id,
      content,
      sender,
      type,
      communication_type: communication_type || null,
      status: 'sent'
    });
    
    // Store metadata FIRST (before saving) if phone numbers provided
    if (user_phone_number && twilio_number) {
      userMessage.metadata = {
        fromNumber: user_phone_number,
        toNumber: twilio_number,
        sentViaTwitter: true,
        direction: 'incoming'
      };
    }
    
    await userMessage.save();
    logger.info(`User message saved to DB: ${userMessage._id} in session ${session_id}`);
    
    // Send message via Twilio FROM user's verified number TO Twilio number
    // Note: The user's number must be verified as a Caller ID in Twilio Console
    // This simulates an incoming message and may trigger webhooks
    if (user_phone_number && twilio_number) {
      logger.info(`📤 Attempting to send via Twilio FROM ${user_phone_number} TO ${twilio_number}`);
      try {
        const channel = await Channel.findById(channel_id);
        
        if (communication_type === 'sms') {
          // Send SMS FROM verified user number TO Twilio number
          logger.info(`📤 Sending SMS via Twilio FROM ${user_phone_number} TO ${twilio_number}`);
          const result = await twilioService.sendSMS(
            twilio_number,      // TO: Twilio number (destination)
            content,            // Message content
            user_phone_number   // FROM: User's VERIFIED number
          );
          logger.info(`✅ SMS sent via Twilio: ${result.sid || (result.isMock ? 'mock' : 'unknown')}`);
        } 
        else if (communication_type === 'whatsapp') {
          // Send WhatsApp FROM user TO Twilio number
          logger.info(`📤 Sending WhatsApp via Twilio FROM ${user_phone_number} TO ${twilio_number}`);
          const result = await twilioService.sendWhatsApp(
            twilio_number,      // TO: Twilio number
            content,
            user_phone_number   // FROM: User's number
          );
          logger.info(`✅ WhatsApp sent via Twilio: ${result.sid || (result.isMock ? 'mock' : 'unknown')}`);
        }
        
      } catch (error) {
        logger.error(`❌ Failed to send message via Twilio:`, error);
        logger.error(`⚠️  Make sure ${user_phone_number} is verified as a Caller ID in Twilio Console`);
        logger.error(`⚠️  Verification URL: https://console.twilio.com/us1/develop/phone-numbers/manage/verified`);
        // Continue even if Twilio fails - message already saved with metadata
      }
    }
    
    // Update session with latest message info
    await Session.findByIdAndUpdate(session_id, {
      $inc: { message_count: 1 },
      last_message_at: new Date()
    });
    
    // Transform user message for frontend
    const userMessageResponse = {
      id: userMessage._id.toString(),
      channel_id: userMessage.channel_id,
      session_id: userMessage.session_id,
      content: userMessage.content,
      sender: userMessage.sender,
      type: userMessage.type,
      communication_type: userMessage.communication_type,
      status: userMessage.status,
      created_at: userMessage.createdAt.toISOString()
    };
    
    // Emit user message to connected clients
    io.to(channel_id).emit('new_message', userMessageResponse);
    
    // Step 2: Generate and save AI response (if enabled and sender is user)
    if (sender === 'user' && aiResponseService.isAIEnabled()) {
      // Don't await - let AI response happen asynchronously
      generateAndSaveAIResponse(channel_id, session_id, content, communication_type, io).catch(err => {
        logger.error('Error generating AI response:', err);
      });
    }
    
    // Return user message immediately
    res.status(201).json(userMessageResponse);
  } catch (error) {
    logger.error('Error in message route:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * Generate and save AI response asynchronously
 */
async function generateAndSaveAIResponse(channel_id, session_id, userMessageContent, communication_type, io) {
  try {
    logger.info('Generating AI response...');
    
    // Generate AI response
    const aiContent = await aiResponseService.generateResponse(session_id, userMessageContent, communication_type);
    
    if (!aiContent) {
      logger.info('AI responses disabled or no response generated');
      return;
    }
    
    // Get channel details for Twilio number
    const channel = await Channel.findById(channel_id);
    if (!channel) {
      logger.error('Channel not found for AI response');
      return;
    }
    
    // Get user's phone number from the most recent user message in this session
    const recentUserMessage = await Message.findOne({
      session_id,
      sender: 'user',
      'metadata.fromNumber': { $exists: true }
    }).sort({ createdAt: -1 });
    
    const userPhoneNumber = recentUserMessage?.metadata?.fromNumber;
    
    // Save AI message to MongoDB
    const aiMessage = new Message({
      channel_id,
      session_id,
      content: aiContent,
      sender: 'contact', // AI responds as 'contact'
      type: 'text',
      communication_type: communication_type || null,
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
        // Continue - message is already saved in DB
      }
    } else {
      logger.warn('Cannot send AI response via Twilio: missing user phone number or Twilio number');
    }
    
    // Update session
    await Session.findByIdAndUpdate(session_id, {
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

// Get single message
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id).lean();
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Transform for frontend compatibility
    res.json({
      id: message._id.toString(),
      channel_id: message.channel_id,
      session_id: message.session_id,
      content: message.content,
      sender: message.sender,
      type: message.type,
      communication_type: message.communication_type,
      status: message.status,
      created_at: message.createdAt
    });
  } catch (error) {
    logger.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

module.exports = router;

