/**
 * TwilioService - Backward compatibility wrapper
 * 
 * This file now exports the messaging provider from the factory.
 * The actual provider (Twilio or AWS) is determined by the MESSAGING_PROVIDER environment variable.
 * 
 * All existing code that imports twilioService will continue to work without changes.
 * The provider implements the same interface, so all methods remain available.
 * 
 * To switch providers, set MESSAGING_PROVIDER=aws or MESSAGING_PROVIDER=twilio
 */

const provider = require('./messagingProviderFactory');

// Export the provider instance
// This maintains backward compatibility with existing code
module.exports = provider;
