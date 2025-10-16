const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  channel_id: {
    type: String,
    required: true,
    index: true
  },
  communication_type: {
    type: String,
    required: true,
    enum: ['whatsapp', 'sms', 'voice'],
    index: true
  },
  title: {
    type: String,
    default: function() {
      const typeLabel = this.communication_type ? 
        this.communication_type.charAt(0).toUpperCase() + this.communication_type.slice(1) : '';
      return `${typeLabel} Session ${new Date().toLocaleString()}`;
    }
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  message_count: {
    type: Number,
    default: 0
  },
  last_message_at: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

// Indexes for better query performance
sessionSchema.index({ channel_id: 1, createdAt: -1 });
sessionSchema.index({ channel_id: 1, communication_type: 1, status: 1 });
sessionSchema.index({ communication_type: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ last_message_at: -1 });
sessionSchema.index({ 'metadata.fromNumber': 1, last_message_at: -1 }); // For session reuse by phone number

// Virtual for created_at (for backwards compatibility)
sessionSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
sessionSchema.set('toJSON', { virtuals: true });
sessionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Session', sessionSchema);

