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
      const args = {
        channel: channel,
        session: session,
        message: content,
        incomingMessage: userMessage,
        communication_type: communication_type,
        io: io
      };
      aiResponseService.generateAndSaveAIResponse(channel_id, session_id, content, communication_type, io, args).catch(err => {
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

