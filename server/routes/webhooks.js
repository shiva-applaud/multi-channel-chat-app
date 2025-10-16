const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Channel = require('../models/Channel');
const aiResponseService = require('../services/aiResponseService');
const crypto = require('crypto');

/**
 * Validate Twilio webhook signature
 * This ensures the request is actually from Twilio
 */
function validateTwilioSignature(req) {
  const twilioSignature = req.headers['x-twilio-signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken || process.env.NODE_ENV === 'development') {
    // Skip validation in development mode
    logger.warn('Twilio signature validation skipped (dev mode or no auth token)');
    return true;
  }
  
  if (!twilioSignature) {
    logger.error('No Twilio signature found in headers');
    return false;
  }
  
  try {
    const twilio = require('twilio');
    const url = `${process.env.SERVER_URL || 'http://localhost:3000'}${req.originalUrl}`;
    const isValid = twilio.validateRequest(authToken, twilioSignature, url, req.body);
    
    if (!isValid) {
      logger.error('Invalid Twilio signature');
    }
    
    return isValid;
  } catch (error) {
    logger.error('Error validating Twilio signature:', error);
    return false;
  }
}

/**
 * Webhook endpoint for incoming SMS messages
 * Twilio will POST to this URL when someone sends an SMS to your Twilio number
 */
router.post('/sms', async (req, res) => {
  try {
    logger.info('Received SMS webhook:', req.body);
    
    // Validate the request is from Twilio (commented out for development)
    // if (!validateTwilioSignature(req)) {
    //   return res.status(403).send('Forbidden');
    // }
    
    const {
      From: fromNumber,
      To: toNumber,
      Body: messageBody,
      MessageSid: messageSid,
      NumMedia: numMedia
    } = req.body;
    
    if (!fromNumber || !toNumber || !messageBody) {
      logger.error('Missing required fields in SMS webhook');
      return res.status(400).send('Bad Request');
    }
    
    logger.info(`SMS received from ${fromNumber} to ${toNumber}: ${messageBody}`);
    
    // Find the channel for this Twilio number
    const channel = await Channel.findOne({ phone_number: toNumber });
    
    if (!channel) {
      logger.warn(`No channel found for Twilio number: ${toNumber}`);
      // Still respond with TwiML to acknowledge receipt
      res.type('text/xml');
      return res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
    
    // Find or create session based on phone number and time gap
    // If last message from this number was within 5 minutes, use same session
    // Otherwise, create a new session
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = new Date();
    
    let session = await Session.findOne({
      channel_id: channel._id.toString(),
      communication_type: 'sms',
      'metadata.fromNumber': fromNumber,
      status: 'active'
    }).sort({ last_message_at: -1 });
    
    // Check if we should reuse existing session or create new one
    if (session && session.last_message_at) {
      const timeSinceLastMessage = now - new Date(session.last_message_at);
      
      if (timeSinceLastMessage > FIVE_MINUTES) {
        // More than 5 minutes passed, create new session
        logger.info(`Time gap of ${Math.round(timeSinceLastMessage / 1000)}s detected. Creating new session.`);
        session = null;
      } else {
        logger.info(`Reusing existing session ${session._id} (last message ${Math.round(timeSinceLastMessage / 1000)}s ago)`);
      }
    }
    
    if (!session) {
      session = new Session({
        channel_id: channel._id.toString(),
        communication_type: 'sms',
        title: `SMS from ${fromNumber}`,
        status: 'active',
        message_count: 0,
        metadata: {
          fromNumber: fromNumber, // Store sender's phone number
          firstMessageAt: now
        }
      });
      await session.save();
      logger.info(`Created new SMS session: ${session._id} for ${fromNumber}`);
    }
    
    // Store the incoming message
    const incomingMessage = new Message({
      channel_id: channel._id.toString(),
      session_id: session._id.toString(),
      content: messageBody,
      sender: 'user', // Message is from the contact (external user)
      type: numMedia && parseInt(numMedia) > 0 ? 'mms' : 'text',
      communication_type: 'sms',
      status: 'received',
      metadata: {
        twilioMessageSid: messageSid,
        fromNumber: fromNumber,
        toNumber: toNumber
      }
    });
    
    await incomingMessage.save();
    logger.info(`Incoming SMS message saved: ${incomingMessage._id}`);
    
    // Update session
    await Session.findByIdAndUpdate(session._id, {
      $inc: { message_count: 1 },
      last_message_at: new Date()
    });
    
    // Broadcast to connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const messageResponse = {
        id: incomingMessage._id.toString(),
        channel_id: incomingMessage.channel_id,
        session_id: incomingMessage.session_id,
        content: incomingMessage.content,
        sender: incomingMessage.sender,
        type: incomingMessage.type,
        communication_type: incomingMessage.communication_type,
        status: incomingMessage.status,
        created_at: incomingMessage.createdAt.toISOString()
      };
      
      io.to(channel._id.toString()).emit('new_message', messageResponse);
      logger.info(`Message broadcast to channel: ${channel._id}`);
    }
    
    // Generate AI response
    let aiReply = 'Thanks for your message!'; // Default fallback
    
    // if (aiResponseService.isAIEnabled()) {
      try {
        logger.info(`Generating AI response for message: "${messageBody}"`);
        aiReply = await aiResponseService.generateResponse(incomingMessage.session_id.toString(), messageBody, 'sms');
        logger.info(`AI response generated: "${aiReply}"`);
        
        // Store AI response in database
        const aiMessage = new Message({
          channel_id: channel._id.toString(),
          session_id: session._id.toString(),
          content: aiReply,
          sender: 'contact', // AI responds as contact
          type: 'text',
          communication_type: 'sms',
          status: 'sent',
          metadata: {
            inResponseTo: messageSid,
            fromNumber: toNumber,
            toNumber: fromNumber,
            generatedBy: 'AI'
          }
        });
        
        await aiMessage.save();
        logger.info(`AI response saved: ${aiMessage._id}`);
        
        // Update session
        await Session.findByIdAndUpdate(session._id, {
          $inc: { message_count: 1 },
          last_message_at: new Date()
        });
        
        // Broadcast AI response to UI
        if (io) {
          io.to(channel._id.toString()).emit('new_message', {
            id: aiMessage._id.toString(),
            channel_id: aiMessage.channel_id,
            session_id: aiMessage.session_id,
            content: aiMessage.content,
            sender: aiMessage.sender,
            type: aiMessage.type,
            communication_type: aiMessage.communication_type,
            status: aiMessage.status,
            created_at: aiMessage.createdAt.toISOString()
          });
          logger.info('AI response broadcast to UI');
        }
        
      } catch (aiError) {
        logger.error('Error generating AI response:', aiError);
        // Continue with fallback response
      }
    // }
    
    // Respond with TwiML containing AI-generated reply
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${aiReply}</Message>
</Response>`);
    
  } catch (error) {
    logger.error('Error processing SMS webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Webhook endpoint for incoming WhatsApp messages
 * Twilio will POST to this URL when someone sends a WhatsApp message
 */
router.post('/whatsapp', async (req, res) => {
  try {
    logger.info('Received WhatsApp webhook:', req.body);
    
    // Validate the request is from Twilio (commented out for development)
    // if (!validateTwilioSignature(req)) {
    //   return res.status(403).send('Forbidden');
    // }
    
    const {
      From: fromNumber,
      To: toNumber,
      Body: messageBody,
      MessageSid: messageSid,
      NumMedia: numMedia
    } = req.body;
    
    // WhatsApp numbers are prefixed with "whatsapp:"
    const cleanFromNumber = fromNumber?.replace('whatsapp:', '');
    const cleanToNumber = toNumber?.replace('whatsapp:', '');
    
    if (!cleanFromNumber || !cleanToNumber || !messageBody) {
      logger.error('Missing required fields in WhatsApp webhook');
      return res.status(400).send('Bad Request');
    }
    
    logger.info(`WhatsApp received from ${cleanFromNumber} to ${cleanToNumber}: ${messageBody}`);
    
    // Find the channel for this Twilio number
    const channel = await Channel.findOne({ phone_number: cleanToNumber });
    
    if (!channel) {
      logger.warn(`No channel found for Twilio number: ${cleanToNumber}`);
      res.type('text/xml');
      return res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
    
    // Find or create session based on phone number and time gap
    // If last message from this number was within 5 minutes, use same session
    // Otherwise, create a new session
    const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = new Date();
    
    let session = await Session.findOne({
      channel_id: channel._id.toString(),
      communication_type: 'whatsapp',
      'metadata.fromNumber': cleanFromNumber,
      status: 'active'
    }).sort({ last_message_at: -1 });
    
    // Check if we should reuse existing session or create new one
    if (session && session.last_message_at) {
      const timeSinceLastMessage = now - new Date(session.last_message_at);
      
      if (timeSinceLastMessage > FIVE_MINUTES) {
        // More than 5 minutes passed, create new session
        logger.info(`WhatsApp: Time gap of ${Math.round(timeSinceLastMessage / 1000)}s detected. Creating new session.`);
        session = null;
      } else {
        logger.info(`WhatsApp: Reusing existing session ${session._id} (last message ${Math.round(timeSinceLastMessage / 1000)}s ago)`);
      }
    }
    
    if (!session) {
      session = new Session({
        channel_id: channel._id.toString(),
        communication_type: 'whatsapp',
        title: `WhatsApp from ${cleanFromNumber}`,
        status: 'active',
        message_count: 0,
        metadata: {
          fromNumber: cleanFromNumber, // Store sender's phone number
          firstMessageAt: now
        }
      });
      await session.save();
      logger.info(`Created new WhatsApp session: ${session._id} for ${cleanFromNumber}`);
    }
    
    // Store the incoming message
    const incomingMessage = new Message({
      channel_id: channel._id.toString(),
      session_id: session._id.toString(),
      content: messageBody,
      sender: 'contact', // Message is from the contact (external user)
      type: numMedia && parseInt(numMedia) > 0 ? 'mms' : 'text',
      communication_type: 'whatsapp',
      status: 'received',
      metadata: {
        twilioMessageSid: messageSid,
        fromNumber: cleanFromNumber,
        toNumber: cleanToNumber
      }
    });
    
    await incomingMessage.save();
    logger.info(`Incoming WhatsApp message saved: ${incomingMessage._id}`);
    
    // Update session
    await Session.findByIdAndUpdate(session._id, {
      $inc: { message_count: 1 },
      last_message_at: new Date()
    });
    
    // Broadcast to connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const messageResponse = {
        id: incomingMessage._id.toString(),
        channel_id: incomingMessage.channel_id,
        session_id: incomingMessage.session_id,
        content: incomingMessage.content,
        sender: incomingMessage.sender,
        type: incomingMessage.type,
        communication_type: incomingMessage.communication_type,
        status: incomingMessage.status,
        created_at: incomingMessage.createdAt.toISOString()
      };
      
      io.to(channel._id.toString()).emit('new_message', messageResponse);
      logger.info(`WhatsApp message broadcast to channel: ${channel._id}`);
    }
    
    // Generate AI response
    let aiReply = 'Thanks for your WhatsApp message!'; // Default fallback
    
    // if (aiResponseService.isAIEnabled()) {
      try {
        logger.info(`Generating AI response for WhatsApp message: "${messageBody}"`);
        aiReply = await aiResponseService.generateResponse(incomingMessage.session_id.toString(), messageBody, 'whatsapp');
        logger.info(`AI response generated: "${aiReply}"`);
        
        // Store AI response in database
        const aiMessage = new Message({
          channel_id: channel._id.toString(),
          session_id: session._id.toString(),
          content: aiReply,
          sender: 'contact', // AI responds as contact
          type: 'text',
          communication_type: 'whatsapp',
          status: 'sent',
          metadata: {
            inResponseTo: messageSid,
            fromNumber: cleanToNumber,
            toNumber: cleanFromNumber,
            generatedBy: 'AI'
          }
        });
        
        await aiMessage.save();
        logger.info(`AI WhatsApp response saved: ${aiMessage._id}`);
        
        // Update session
        await Session.findByIdAndUpdate(session._id, {
          $inc: { message_count: 1 },
          last_message_at: new Date()
        });
        
        // Broadcast AI response to UI
        if (io) {
          io.to(channel._id.toString()).emit('new_message', {
            id: aiMessage._id.toString(),
            channel_id: aiMessage.channel_id,
            session_id: aiMessage.session_id,
            content: aiMessage.content,
            sender: aiMessage.sender,
            type: aiMessage.type,
            communication_type: aiMessage.communication_type,
            status: aiMessage.status,
            created_at: aiMessage.createdAt.toISOString()
          });
          logger.info('AI WhatsApp response broadcast to UI');
        }
        
      } catch (aiError) {
        logger.error('Error generating AI WhatsApp response:', aiError);
        // Continue with fallback response
      }
    // }
    
    // Respond with TwiML containing AI-generated reply
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${aiReply}</Message>
</Response>`);
    
  } catch (error) {
    logger.error('Error processing WhatsApp webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Webhook endpoint for incoming voice calls
 * Twilio will POST to this URL when someone calls your Twilio number
 */
router.post('/voice', async (req, res) => {
  try {
    logger.info('Received voice webhook:', req.body);
    
    const {
      From: fromNumber,
      To: toNumber,
      CallSid: callSid
    } = req.body;
    
    logger.info(`Voice call from ${fromNumber} to ${toNumber}`);
    
    // Find the channel
    const channel = await Channel.findOne({ phone_number: toNumber });
    
    if (channel) {
      // Find or create session based on phone number and time gap
      // If last call from this number was within 5 minutes, use same session
      // Otherwise, create a new session
      const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
      const now = new Date();
      
      let session = await Session.findOne({
        channel_id: channel._id.toString(),
        communication_type: 'voice',
        'metadata.fromNumber': fromNumber,
        status: 'active'
      }).sort({ last_message_at: -1 });
      
      // Check if we should reuse existing session or create new one
      if (session && session.last_message_at) {
        const timeSinceLastMessage = now - new Date(session.last_message_at);
        
        if (timeSinceLastMessage > FIVE_MINUTES) {
          // More than 5 minutes passed, create new session
          logger.info(`Voice: Time gap of ${Math.round(timeSinceLastMessage / 1000)}s detected. Creating new session.`);
          session = null;
        } else {
          logger.info(`Voice: Reusing existing session ${session._id} (last call ${Math.round(timeSinceLastMessage / 1000)}s ago)`);
        }
      }
      
      if (!session) {
        session = new Session({
          channel_id: channel._id.toString(),
          communication_type: 'voice',
          title: `Call from ${fromNumber}`,
          status: 'active',
          message_count: 0,
          metadata: {
            fromNumber: fromNumber, // Store caller's phone number
            firstMessageAt: now
          }
        });
        await session.save();
        logger.info(`Created new Voice session: ${session._id} for ${fromNumber}`);
      }
      
      // Log the call
      const callMessage = new Message({
        channel_id: channel._id.toString(),
        session_id: session._id.toString(),
        content: `Incoming call from ${fromNumber}`,
        sender: 'contact',
        type: 'call',
        communication_type: 'voice',
        status: 'received',
        metadata: {
          twilioCallSid: callSid,
          fromNumber: fromNumber,
          toNumber: toNumber
        }
      });
      
      await callMessage.save();
      
      // Update session
      await Session.findByIdAndUpdate(session._id, {
        $inc: { message_count: 1 },
        last_message_at: new Date()
      });
      
      // Broadcast to clients
      const io = req.app.get('io');
      if (io) {
        io.to(channel._id.toString()).emit('new_message', {
          id: callMessage._id.toString(),
          channel_id: callMessage.channel_id,
          session_id: callMessage.session_id,
          content: callMessage.content,
          sender: callMessage.sender,
          type: callMessage.type,
          communication_type: callMessage.communication_type,
          status: callMessage.status,
          created_at: callMessage.createdAt.toISOString()
        });
      }
    }
    
    // Respond with TwiML to handle the call
    res.type('text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Your call has been received. This is a demo application.</Say>
  <Pause length="1"/>
  <Say>Goodbye!</Say>
</Response>`);
    
  } catch (error) {
    logger.error('Error processing voice webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Status callback for message delivery updates
 */
router.post('/status', async (req, res) => {
  try {
    logger.info('Received status callback:', req.body);
    
    const {
      MessageSid: messageSid,
      MessageStatus: messageStatus
    } = req.body;
    
    // Update message status in database
    if (messageSid) {
      const message = await Message.findOne({ 'metadata.twilioMessageSid': messageSid });
      if (message) {
        message.status = messageStatus;
        await message.save();
        logger.info(`Updated message ${messageSid} status to: ${messageStatus}`);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error processing status callback:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Health check endpoint for webhooks
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Webhook endpoints are active',
    endpoints: {
      sms: '/api/webhooks/sms',
      whatsapp: '/api/webhooks/whatsapp',
      voice: '/api/webhooks/voice',
      status: '/api/webhooks/status'
    }
  });
});

module.exports = router;

