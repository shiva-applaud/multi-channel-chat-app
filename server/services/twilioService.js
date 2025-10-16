const logger = require('../utils/logger');

class TwilioService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.client = null;
    
    if (this.accountSid && this.authToken && this.accountSid !== 'your_account_sid_here') {
      try {
        const twilio = require('twilio');
        this.client = twilio(this.accountSid, this.authToken);
        logger.info('Twilio client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Twilio client:', error);
      }
    } else {
      logger.warn('Twilio credentials not configured. Phone number generation will use mock data.');
    }
  }

  /**
   * Get country code mapping for Twilio
   */
  getCountryCodeMapping() {
    return {
      'usa': { iso: 'US', code: '+1' },
      'united states': { iso: 'US', code: '+1' },
      'us': { iso: 'US', code: '+1' },
      'canada': { iso: 'CA', code: '+1' },
      'ca': { iso: 'CA', code: '+1' },
      'uk': { iso: 'GB', code: '+44' },
      'united kingdom': { iso: 'GB', code: '+44' },
      'gb': { iso: 'GB', code: '+44' },
      'india': { iso: 'IN', code: '+91' },
      'in': { iso: 'IN', code: '+91' },
      'australia': { iso: 'AU', code: '+61' },
      'au': { iso: 'AU', code: '+61' },
      'germany': { iso: 'DE', code: '+49' },
      'de': { iso: 'DE', code: '+49' },
      'france': { iso: 'FR', code: '+33' },
      'fr': { iso: 'FR', code: '+33' },
      'japan': { iso: 'JP', code: '+81' },
      'jp': { iso: 'JP', code: '+81' },
      'china': { iso: 'CN', code: '+86' },
      'cn': { iso: 'CN', code: '+86' },
      'brazil': { iso: 'BR', code: '+55' },
      'br': { iso: 'BR', code: '+55' },
      'mexico': { iso: 'MX', code: '+52' },
      'mx': { iso: 'MX', code: '+52' },
      'spain': { iso: 'ES', code: '+34' },
      'es': { iso: 'ES', code: '+34' },
      'italy': { iso: 'IT', code: '+39' },
      'it': { iso: 'IT', code: '+39' },
      'netherlands': { iso: 'NL', code: '+31' },
      'nl': { iso: 'NL', code: '+31' },
    };
  }

  /**
   * Get country info from country name
   */
  getCountryInfo(countryName) {
    const mapping = this.getCountryCodeMapping();
    const normalized = countryName.toLowerCase().trim();
    return mapping[normalized] || null;
  }

  /**
   * Generate a mock phone number for testing
   */
  generateMockPhoneNumber(countryCode) {
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000;
    return `${countryCode}${randomNumber}`;
  }

  /**
   * Purchase a phone number from Twilio
   * @param {string} country - Country name (e.g., "USA", "India")
   * @returns {Promise<Object>} - Phone number details
   */
  async purchasePhoneNumber(country) {
    try {
      const countryInfo = this.getCountryInfo(country);
      
      if (!countryInfo) {
        throw new Error(`Unsupported country: ${country}`);
      }

      // If Twilio is configured, return the configured number
      if (this.client && process.env.TWILIO_PHONE_NUMBER) {
        logger.info(`Using configured Twilio number: ${process.env.TWILIO_PHONE_NUMBER}`);
        return {
          phoneNumber: process.env.TWILIO_PHONE_NUMBER,
          friendlyName: `${country} - ${process.env.TWILIO_PHONE_NUMBER}`,
          countryCode: countryInfo.code,
          iso_country: countryInfo.iso,
          capabilities: {
            voice: true,
            sms: true,
            mms: true,
            whatsapp: true
          },
          isMock: false
        };
      }

      // If Twilio is not configured, return mock data
      if (!this.client) {
        logger.info(`Generating mock phone number for ${country}`);
        const mockNumber = this.generateMockPhoneNumber(countryInfo.code);
        return {
          phoneNumber: mockNumber,
          friendlyName: `${country} - ${mockNumber}`,
          countryCode: countryInfo.code,
          iso_country: countryInfo.iso,
          capabilities: {
            voice: true,
            sms: true,
            mms: true
          },
          isMock: true
        };
      }

      logger.info(`Searching for available phone numbers in ${country} (${countryInfo.iso})`);

      // Search for available phone numbers
      const availableNumbers = await this.client
        .availablePhoneNumbers(countryInfo.iso)
        .local
        .list({
          limit: 1,
          smsEnabled: true,
          voiceEnabled: true
        });

      if (!availableNumbers || availableNumbers.length === 0) {
        throw new Error(`No available phone numbers in ${country}`);
      }

      const selectedNumber = availableNumbers[0];
      logger.info(`Found available number: ${selectedNumber.phoneNumber}`);

      // Purchase the phone number
      const purchasedNumber = await this.client.incomingPhoneNumbers.create({
        phoneNumber: selectedNumber.phoneNumber,
        friendlyName: `Multi-Channel Chat - ${country}`,
        smsUrl: process.env.SMS_WEBHOOK_URL || `${process.env.SERVER_URL}/api/webhooks/sms`,
        voiceUrl: process.env.VOICE_WEBHOOK_URL || `${process.env.SERVER_URL}/api/webhooks/voice`,
      });

      logger.info(`Successfully purchased phone number: ${purchasedNumber.phoneNumber}`);

      return {
        phoneNumber: purchasedNumber.phoneNumber,
        friendlyName: purchasedNumber.friendlyName,
        countryCode: countryInfo.code,
        iso_country: countryInfo.iso,
        sid: purchasedNumber.sid,
        capabilities: purchasedNumber.capabilities,
        isMock: false
      };
    } catch (error) {
      logger.error('Error purchasing phone number:', error);
      
      // If Twilio API fails, return mock data as fallback
      if (error.code === 20003 || error.code === 20404) {
        logger.warn('Twilio API error, falling back to mock number');
        const countryInfo = this.getCountryInfo(country);
        const mockNumber = this.generateMockPhoneNumber(countryInfo.code);
        return {
          phoneNumber: mockNumber,
          friendlyName: `${country} - ${mockNumber}`,
          countryCode: countryInfo.code,
          iso_country: countryInfo.iso,
          capabilities: {
            voice: true,
            sms: true,
            mms: true
          },
          isMock: true
        };
      }
      
      throw error;
    }
  }

  /**
   * List all purchased phone numbers
   */
  async listPhoneNumbers() {
    try {
      if (!this.client) {
        return [];
      }

      const numbers = await this.client.incomingPhoneNumbers.list({ limit: 100 });
      return numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        sid: num.sid,
        capabilities: num.capabilities
      }));
    } catch (error) {
      logger.error('Error listing phone numbers:', error);
      return [];
    }
  }

  /**
   * Release a phone number
   */
  async releasePhoneNumber(phoneNumberSid) {
    try {
      if (!this.client) {
        logger.warn('Cannot release phone number: Twilio not configured');
        return { success: true, isMock: true };
      }

      await this.client.incomingPhoneNumbers(phoneNumberSid).remove();
      logger.info(`Successfully released phone number: ${phoneNumberSid}`);
      return { success: true };
    } catch (error) {
      logger.error('Error releasing phone number:', error);
      throw error;
    }
  }

  /**
   * Send an SMS message via Twilio
   * @param {string} to - Recipient phone number (e.g., "+1234567890")
   * @param {string} message - Message content
   * @param {string} from - Sender phone number (defaults to TWILIO_PHONE_NUMBER)
   * @returns {Promise<Object>} - Message details
   */
  async sendSMS(to, message, from = null) {
    try {
      if (!this.client) {
        logger.warn('Twilio not configured. Simulating SMS send.');
        return {
          sid: `SM${Date.now()}`,
          to,
          from: from || process.env.TWILIO_PHONE_NUMBER || '+15703251809',
          body: message,
          status: 'queued',
          isMock: true
        };
      }

      const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
      
      if (!fromNumber) {
        throw new Error('No sender phone number configured');
      }

      logger.info(`Sending SMS from ${fromNumber} to ${to}`);

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: fromNumber,
        to: to
      });

      logger.info(`SMS sent successfully. SID: ${twilioMessage.sid}, Status: ${twilioMessage.status}`);

      return {
        sid: twilioMessage.sid,
        to: twilioMessage.to,
        from: twilioMessage.from,
        body: twilioMessage.body,
        status: twilioMessage.status,
        dateCreated: twilioMessage.dateCreated,
        isMock: false
      };
    } catch (error) {
      logger.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Send a WhatsApp message via Twilio
   * @param {string} to - Recipient phone number with country code (e.g., "+1234567890")
   * @param {string} message - Message content
   * @param {string} from - Sender phone number (defaults to TWILIO_PHONE_NUMBER)
   * @returns {Promise<Object>} - Message details
   */
  async sendWhatsApp(to, message, from = null) {
    try {
      if (!this.client) {
        logger.warn('Twilio not configured. Simulating WhatsApp send.');
        return {
          sid: `WA${Date.now()}`,
          to: `whatsapp:${to}`,
          from: `whatsapp:${from || process.env.TWILIO_PHONE_NUMBER || '+15703251809'}`,
          body: message,
          status: 'queued',
          isMock: true
        };
      }

      const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
      
      if (!fromNumber) {
        throw new Error('No sender phone number configured');
      }

      // WhatsApp numbers must be prefixed with "whatsapp:"
      const whatsappFrom = `whatsapp:${fromNumber}`;
      const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      logger.info(`Sending WhatsApp message from ${whatsappFrom} to ${whatsappTo}`);

      const twilioMessage = await this.client.messages.create({
        body: message,
        from: whatsappFrom,
        to: whatsappTo
      });

      logger.info(`WhatsApp message sent successfully. SID: ${twilioMessage.sid}, Status: ${twilioMessage.status}`);

      return {
        sid: twilioMessage.sid,
        to: twilioMessage.to,
        from: twilioMessage.from,
        body: twilioMessage.body,
        status: twilioMessage.status,
        dateCreated: twilioMessage.dateCreated,
        isMock: false
      };
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Make a voice call via Twilio
   * @param {string} to - Recipient phone number
   * @param {string} twimlUrl - TwiML URL or instructions
   * @param {string} from - Sender phone number (defaults to TWILIO_PHONE_NUMBER)
   * @returns {Promise<Object>} - Call details
   */
  async makeCall(to, twimlUrl, from = null) {
    try {
      if (!this.client) {
        logger.warn('Twilio not configured. Simulating voice call.');
        return {
          sid: `CA${Date.now()}`,
          to,
          from: from || process.env.TWILIO_PHONE_NUMBER || '+15703251809',
          status: 'queued',
          isMock: true
        };
      }

      const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
      
      if (!fromNumber) {
        throw new Error('No sender phone number configured');
      }

      logger.info(`Making call from ${fromNumber} to ${to}`);

      const call = await this.client.calls.create({
        url: twimlUrl,
        to: to,
        from: fromNumber
      });

      logger.info(`Call initiated successfully. SID: ${call.sid}, Status: ${call.status}`);

      return {
        sid: call.sid,
        to: call.to,
        from: call.from,
        status: call.status,
        dateCreated: call.dateCreated,
        isMock: false
      };
    } catch (error) {
      logger.error('Error making call:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new TwilioService();

