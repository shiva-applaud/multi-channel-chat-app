const express = require('express');
const router = express.Router();
const aiResponseService = require('../services/aiResponseService');
const logger = require('../utils/logger');

// Get AI status
router.get('/status', (req, res) => {
  try {
    res.json({
      enabled: aiResponseService.isAIEnabled(),
      provider: aiResponseService.aiProvider,
      delay: aiResponseService.responseDelay
    });
  } catch (error) {
    logger.error('Error getting AI status:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

// Enable AI responses
router.post('/enable', (req, res) => {
  try {
    aiResponseService.enable();
    res.json({ 
      message: 'AI responses enabled',
      enabled: true 
    });
  } catch (error) {
    logger.error('Error enabling AI:', error);
    res.status(500).json({ error: 'Failed to enable AI responses' });
  }
});

// Disable AI responses
router.post('/disable', (req, res) => {
  try {
    aiResponseService.disable();
    res.json({ 
      message: 'AI responses disabled',
      enabled: false 
    });
  } catch (error) {
    logger.error('Error disabling AI:', error);
    res.status(500).json({ error: 'Failed to disable AI responses' });
  }
});

// Test AI response generation
router.post('/test', async (req, res) => {
  try {
    const { message, communication_type = 'whatsapp' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // generateResponse(session_id, userMessage, communicationType)
    const response = await aiResponseService.generateResponse('test-session', message, communication_type);
    
    res.json({
      userMessage: message,
      aiResponse: response,
      enabled: aiResponseService.isAIEnabled()
    });
  } catch (error) {
    logger.error('Error testing AI response:', error);
    res.status(500).json({ error: 'Failed to generate test response' });
  }
});

module.exports = router;

