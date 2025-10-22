/**
 * IMessagingProvider - Interface for messaging providers
 * 
 * This interface defines the contract that all messaging providers must implement.
 * Providers include Twilio, AWS SNS, and others.
 * 
 * @interface IMessagingProvider
 */
class IMessagingProvider {
  /**
   * Send an SMS message
   * @param {string} to - Recipient phone number (e.g., +1234567890)
   * @param {string} body - Message body/content
   * @param {string} from - Sender phone number (e.g., +1234567890)
   * @returns {Promise<Object>} Result object with {sid, status, isMock}
   */
  async sendSMS(to, body, from) {
    throw new Error('sendSMS() must be implemented by provider');
  }

  /**
   * Send a WhatsApp message
   * @param {string} to - Recipient WhatsApp number (e.g., +1234567890)
   * @param {string} body - Message body/content
   * @param {string} from - Sender WhatsApp number (e.g., +1234567890)
   * @returns {Promise<Object>} Result object with {sid, status, isMock}
   */
  async sendWhatsApp(to, body, from) {
    throw new Error('sendWhatsApp() must be implemented by provider');
  }

  /**
   * Check if SMS is configured
   * @returns {boolean} True if SMS service is configured and ready
   */
  isSmsConfigured() {
    throw new Error('isSmsConfigured() must be implemented by provider');
  }

  /**
   * Check if WhatsApp is configured
   * @returns {boolean} True if WhatsApp service is configured and ready
   */
  isWhatsAppConfigured() {
    throw new Error('isWhatsAppConfigured() must be implemented by provider');
  }

  /**
   * Validate webhook signature to ensure request is from the provider
   * @param {Object} req - Express request object
   * @returns {boolean} True if signature is valid
   */
  validateWebhookSignature(req) {
    throw new Error('validateWebhookSignature() must be implemented by provider');
  }

  /**
   * Parse incoming webhook payload to a normalized format
   * @param {Object} req - Express request object
   * @param {string} type - Webhook type ('sms' or 'whatsapp')
   * @returns {Object} Normalized webhook data {from, to, body, messageSid, numMedia}
   */
  parseIncomingWebhook(req, type) {
    throw new Error('parseIncomingWebhook() must be implemented by provider');
  }

  /**
   * Get configuration status
   * @returns {Object} Configuration details
   */
  getConfigurationStatus() {
    throw new Error('getConfigurationStatus() must be implemented by provider');
  }

  /**
   * Get provider name
   * @returns {string} Provider name (e.g., 'twilio', 'aws')
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented by provider');
  }
}

module.exports = IMessagingProvider;

