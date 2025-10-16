const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channel_id: {
    type: String,
    required: true,
    index: true
  },
  session_id: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'contact']
  },
  type: {
    type: String,
    default: 'text',
    enum: ['text', 'image', 'video', 'audio', 'file', 'mms', 'call']
  },
  communication_type: {
    type: String,
    enum: ['whatsapp', 'sms', 'voice'],
    default: null
  },
  status: {
    type: String,
    default: 'sent',
    enum: ['sent', 'delivered', 'read', 'failed', 'received', 'queued']
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'messages'
});

// Indexes for better query performance
messageSchema.index({ channel_id: 1, createdAt: -1 });
messageSchema.index({ session_id: 1, createdAt: -1 });
messageSchema.index({ channel_id: 1, session_id: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ communication_type: 1 });
messageSchema.index({ status: 1 });

// Virtual for created_at (for backwards compatibility)
messageSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);

