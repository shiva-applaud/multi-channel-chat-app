const logger = require('../utils/logger');

/**
 * MessagingProviderFactory
 * 
 * Factory class that creates and returns the appropriate messaging provider
 * based on the MESSAGING_PROVIDER environment variable.
 * 
 * Supported providers:
 * - 'twilio': Twilio SMS and WhatsApp
 * - 'aws': AWS SNS (SMS) and AWS End User Messaging Social (WhatsApp)
 * 
 * Default: 'twilio'
 */
class MessagingProviderFactory {
  constructor() {
    this.provider = null;
    this.providerType = null;
  }

  /**
   * Get or create the messaging provider instance
   * @returns {IMessagingProvider} Messaging provider instance
   */
  getProvider() {
    if (this.provider) {
      return this.provider;
    }

    const providerType = (process.env.MESSAGING_PROVIDER || 'twilio').toLowerCase();
    this.providerType = providerType;

    logger.info(`Initializing messaging provider: ${providerType}`);

    switch (providerType) {
      case 'aws':
        const AWSProvider = require('./providers/AWSProvider');
        this.provider = new AWSProvider();
        logger.info('AWS messaging provider initialized');
        break;

      case 'twilio':
        const TwilioProvider = require('./providers/TwilioProvider');
        this.provider = new TwilioProvider();
        logger.info('Twilio messaging provider initialized');
        break;
      default:
        this.provider = new TwilioProvider();
        logger.info('Twilio messaging provider initialized');
        break;
    }

    // Log configuration status
    const status = this.provider.getConfigurationStatus();
    logger.info('Provider configuration:', status);

    return this.provider;
  }

  /**
   * Get the current provider type
   * @returns {string} Provider type ('twilio' or 'aws')
   */
  getProviderType() {
    return this.providerType || (process.env.MESSAGING_PROVIDER || 'twilio').toLowerCase();
  }

  /**
   * Reset the provider (useful for testing)
   */
  reset() {
    this.provider = null;
    this.providerType = null;
  }
}

// Export singleton instance
const factory = new MessagingProviderFactory();
module.exports = factory.getProvider();

// Also export the factory for testing purposes
module.exports.factory = factory;

