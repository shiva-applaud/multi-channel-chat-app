const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const Session = require('../models/Session');
const Message = require('../models/Message');

// Get all sessions (optionally filter by channel, status, or communication type)
router.get('/', async (req, res) => {
  try {
    const { channel_id, status, communication_type } = req.query;
    const filter = {};
    
    if (channel_id) filter.channel_id = channel_id;
    if (status) filter.status = status;
    if (communication_type) filter.communication_type = communication_type;
    
    const sessions = await Session.find(filter)
      .sort({ last_message_at: -1 })
      .lean();
    
    // Transform for frontend compatibility
    const transformedSessions = sessions.map(session => ({
      id: session._id.toString(),
      channel_id: session.channel_id,
      communication_type: session.communication_type,
      title: session.title,
      description: session.description,
      status: session.status,
      message_count: session.message_count,
      last_message_at: session.last_message_at,
      created_at: session.createdAt,
      updated_at: session.updatedAt
    }));
    
    res.json(transformedSessions);
  } catch (error) {
    logger.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get single session
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id).lean();
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Transform for frontend compatibility
    res.json({
      id: session._id.toString(),
      channel_id: session.channel_id,
      communication_type: session.communication_type,
      title: session.title,
      description: session.description,
      status: session.status,
      message_count: session.message_count,
      last_message_at: session.last_message_at,
      created_at: session.createdAt,
      updated_at: session.updatedAt
    });
  } catch (error) {
    logger.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get messages for a specific session
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await Message.find({ session_id: id })
      .sort({ createdAt: 1 })
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
    logger.error('Error fetching session messages:', error);
    res.status(500).json({ error: 'Failed to fetch session messages' });
  }
});

// Create new session
router.post('/', async (req, res) => {
  try {
    const { channel_id, communication_type, title, description } = req.body;
    
    if (!channel_id) {
      return res.status(400).json({ error: 'channel_id is required' });
    }
    
    if (!communication_type) {
      return res.status(400).json({ error: 'communication_type is required' });
    }
    
    const session = new Session({
      channel_id,
      communication_type,
      title: title || undefined, // Let model default handle it
      description: description || '',
      status: 'active',
      message_count: 0
    });
    
    await session.save();
    logger.info(`New ${communication_type} session created: ${session._id} for channel ${channel_id}`);
    
    res.status(201).json({
      id: session._id.toString(),
      channel_id: session.channel_id,
      communication_type: session.communication_type,
      title: session.title,
      description: session.description,
      status: session.status,
      message_count: session.message_count,
      last_message_at: session.last_message_at,
      created_at: session.createdAt
    });
  } catch (error) {
    logger.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    
    const session = await Session.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      id: session._id.toString(),
      channel_id: session.channel_id,
      communication_type: session.communication_type,
      title: session.title,
      description: session.description,
      status: session.status,
      message_count: session.message_count,
      last_message_at: session.last_message_at
    });
  } catch (error) {
    logger.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session (and optionally its messages)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { delete_messages } = req.query;
    
    const session = await Session.findByIdAndDelete(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Optionally delete all messages in this session
    if (delete_messages === 'true') {
      const result = await Message.deleteMany({ session_id: id });
      logger.info(`Deleted ${result.deletedCount} messages from session ${id}`);
    }
    
    res.json({ 
      message: 'Session deleted successfully',
      messages_deleted: delete_messages === 'true'
    });
  } catch (error) {
    logger.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Archive session
router.post('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await Session.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      message: 'Session archived successfully',
      session: {
        id: session._id.toString(),
        status: session.status
      }
    });
  } catch (error) {
    logger.error('Error archiving session:', error);
    res.status(500).json({ error: 'Failed to archive session' });
  }
});

module.exports = router;

