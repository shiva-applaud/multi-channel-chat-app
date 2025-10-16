const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const twilioService = require('../services/twilioService');
const Channel = require('../models/Channel');

// Generate phone number from Twilio and store in MongoDB
router.post('/generate-phone-number', async (req, res) => {
  try {
    const { country, name, type } = req.body;
    
    if (!country) {
      return res.status(400).json({ error: 'Country is required' });
    }

    logger.info(`Generating phone number for country: ${country}`);
    
    // Step 1: Call Twilio API to purchase phone number
    const phoneNumberData = await twilioService.purchasePhoneNumber(country);
    logger.info(`Phone number obtained: ${phoneNumberData.phoneNumber}`);
    
    // Step 2: Store number in MongoDB
    const channelName = name || `${country} - ${phoneNumberData.phoneNumber}`;
    const channelType = type || 'whatsapp'; // Default to whatsapp
    
    const channel = new Channel({
      name: channelName,
      phone_number: phoneNumberData.phoneNumber,
      country_code: phoneNumberData.countryCode,
      type: channelType,
      status: 'active',
      twilio_sid: phoneNumberData.sid || null
    });
    
    await channel.save();
    logger.info(`Phone number stored in MongoDB with ID: ${channel._id}`);
    
    // Step 3: Return complete channel data to frontend
    res.json({
      id: channel._id.toString(),
      name: channel.name,
      phoneNumber: channel.phone_number,
      countryCode: channel.country_code,
      isoCountry: phoneNumberData.iso_country,
      type: channel.type,
      status: channel.status,
      capabilities: phoneNumberData.capabilities,
      isMock: phoneNumberData.isMock || false,
      twilioSid: channel.twilio_sid,
      createdAt: channel.createdAt.toISOString(),
      message: phoneNumberData.isMock 
        ? 'Mock phone number generated and stored (Twilio not configured)' 
        : 'Phone number purchased and stored successfully'
    });
  } catch (error) {
    logger.error('Error generating phone number:', error);
    res.status(500).json({ 
      error: 'Failed to generate phone number',
      details: error.message 
    });
  }
});

// Get all channels
router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find()
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform for frontend compatibility
    const transformedChannels = channels.map(channel => ({
      id: channel._id.toString(),
      name: channel.name,
      phone_number: channel.phone_number,
      country_code: channel.country_code,
      type: channel.type,
      status: channel.status,
      twilio_sid: channel.twilio_sid,
      created_at: channel.createdAt
    }));
    
    res.json(transformedChannels);
  } catch (error) {
    logger.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Get single channel
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id).lean();
    
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Transform for frontend compatibility
    res.json({
      id: channel._id.toString(),
      name: channel.name,
      phone_number: channel.phone_number,
      country_code: channel.country_code,
      type: channel.type,
      status: channel.status,
      twilio_sid: channel.twilio_sid,
      created_at: channel.createdAt
    });
  } catch (error) {
    logger.error('Error fetching channel:', error);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

// Create new channel (manual creation, not via Twilio)
router.post('/', async (req, res) => {
  try {
    const { name, phone_number, country_code, type } = req.body;
    
    if (!name || !phone_number || !country_code || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const channel = new Channel({
      name,
      phone_number,
      country_code,
      type,
      status: 'active'
    });
    
    await channel.save();
    
    res.status(201).json({
      id: channel._id.toString(),
      name: channel.name,
      phone_number: channel.phone_number,
      country_code: channel.country_code,
      type: channel.type,
      status: channel.status,
      created_at: channel.createdAt
    });
  } catch (error) {
    logger.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Delete channel
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Channel.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    logger.error('Error deleting channel:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

module.exports = router;

