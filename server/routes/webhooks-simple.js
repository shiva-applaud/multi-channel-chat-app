/**
 * Simplified Twilio Webhooks (Based on Your Example)
 * 
 * This is a simplified version if you prefer the basic pattern.
 * Your existing webhooks.js is MORE POWERFUL and includes:
 * - MongoDB storage
 * - Socket.IO broadcasting
 * - Session management
 * 
 * To use this instead:
 * 1. In server/index.js, change:
 *    app.use('/api/webhooks', require('./routes/webhooks-simple'));
 * 2. Restart server
 */

const express = require('express');
const router = express.Router();

/**
 * Simple SMS Webhook - Based on your example pattern
 */
router.post('/sms', (req, res) => {
  console.log("Incoming SMS:", req.body);
  
  const from = req.body.From;
  const to = req.body.To;
  const body = req.body.Body;
  
  console.log(`SMS from ${from} to ${to}: ${body}`);
  
  // Simple TwiML response
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You said: ${body}</Message>
</Response>`);
});

/**
 * Simple WhatsApp Webhook
 */
router.post('/whatsapp', (req, res) => {
  console.log("Incoming WhatsApp:", req.body);
  
  const from = req.body.From?.replace('whatsapp:', '');
  const body = req.body.Body;
  
  console.log(`WhatsApp from ${from}: ${body}`);
  
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You said: ${body}</Message>
</Response>`);
});

/**
 * Simple Voice Webhook
 */
router.post('/voice', (req, res) => {
  console.log("Incoming call:", req.body);
  
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! You have reached the webhook.</Say>
</Response>`);
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Simple webhooks active' });
});

module.exports = router;

