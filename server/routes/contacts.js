const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const Contact = require('../models/Contact');

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ name: 1 })
      .lean();
    
    // Transform for frontend compatibility
    const transformedContacts = contacts.map(contact => ({
      id: contact._id.toString(),
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email,
      created_at: contact.createdAt
    }));
    
    res.json(transformedContacts);
  } catch (error) {
    logger.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get single contact
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id).lean();
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Transform for frontend compatibility
    res.json({
      id: contact._id.toString(),
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email,
      created_at: contact.createdAt
    });
  } catch (error) {
    logger.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Create new contact
router.post('/', async (req, res) => {
  try {
    const { name, phone_number, email } = req.body;
    
    if (!name || !phone_number) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }
    
    const contact = new Contact({
      name,
      phone_number,
      email: email || null
    });
    
    await contact.save();
    
    res.status(201).json({
      id: contact._id.toString(),
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email,
      created_at: contact.createdAt
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate phone number
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    logger.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, email } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { name, phone_number, email: email || null },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({
      id: contact._id.toString(),
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }
    logger.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Contact.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    logger.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
