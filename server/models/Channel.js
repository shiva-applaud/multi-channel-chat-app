const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone_number: {
    type: String,
    required: true,
    trim: true
  },
  country_code: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['whatsapp', 'sms', 'voice'],
    default: 'whatsapp'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  twilio_sid: {
    type: String,
    default: null
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  collection: 'channels'
});

// Indexes for better query performance
channelSchema.index({ phone_number: 1 });
channelSchema.index({ type: 1 });
channelSchema.index({ status: 1 });
channelSchema.index({ createdAt: -1 });

// Virtual for created_at (for backwards compatibility with frontend)
channelSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
channelSchema.set('toJSON', { virtuals: true });
channelSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Channel', channelSchema);

