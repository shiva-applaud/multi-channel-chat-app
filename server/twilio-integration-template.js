/**
 * Twilio Integration Module (Template Style)
 * 
 * This is a reference implementation following the standard Twilio template pattern.
 * Your actual implementation in twilioService.js and webhooks.js is MORE COMPREHENSIVE.
 * 
 * This file is provided for reference and comparison only.
 */

const express = require('express');
const bodyParser = require('body-parser');
const { twiml: { MessagingResponse } } = require('twilio');
const twilio = require('twilio');

const router = express.Router();

// Load from configuration / env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_SMS_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Send a message (SMS or WhatsApp)
 * @param {string} to E.164 number, or "whatsapp:+<num>"
 * @param {string} from E.164 number, or "whatsapp:+<num>"
 * @param {string} body text message
 * @param {object} [opts] extra options e.g. statusCallback, mediaUrl
 */
async function sendMessage(to, from, body, opts = {}) {
  const params = {
    to,
    from,
    body,
    ...opts
  };
  return client.messages.create(params);
}

/**
 * Webhook endpoint to receive incoming messages
 * Handles both SMS and WhatsApp
 */
router.post('/incoming-message', (req, res) => {
  // Twilio posts form data (application/x-www-form-urlencoded)
  const from = req.body.From;
  const to = req.body.To;
  const body = req.body.Body;
  const numMedia = parseInt(req.body.NumMedia, 10) || 0;

  console.log("Incoming message:", { from, to, body, numMedia });

  // Create TwiML response
  const response = new MessagingResponse();

  if (numMedia > 0) {
    // If media is included, you can access via req.body.MediaUrl0, MediaContentType0, etc.
    const msg = response.message("Thanks for the media!");
    // Optionally respond with media back
    // msg.media("https://example.com/your-image.jpg");
  } else {
    response.message(`You said: ${body}`);
  }

  // Send TwiML response
  res.type('text/xml').send(response.toString());
});

/**
 * Example: Send a test SMS
 */
async function sendTestSMS(to) {
  const from = process.env.TWILIO_PHONE_NUMBER || '+15703251809';
  return sendMessage(to, from, "Hello from Twilio via Node.js!");
}

/**
 * Example: Send a test WhatsApp message
 */
async function sendTestWhatsApp(to) {
  const from = process.env.TWILIO_PHONE_NUMBER || '+15703251809';
  // WhatsApp requires whatsapp: prefix
  return sendMessage(
    `whatsapp:${to}`,
    `whatsapp:${from}`,
    "Hello from Twilio WhatsApp via Node.js!"
  );
}

/**
 * Validate Twilio webhook signature (recommended for production)
 */
function validateTwilioRequest(req) {
  const signature = req.headers['x-twilio-signature'];
  const url = `${process.env.SERVER_URL}${req.originalUrl}`;
  
  return twilio.validateRequest(
    authToken,
    signature,
    url,
    req.body
  );
}

// Export functions and router
module.exports = {
  router,
  sendMessage,
  sendTestSMS,
  sendTestWhatsApp,
  validateTwilioRequest,
  client
};

