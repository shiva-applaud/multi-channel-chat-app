const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  }
}, {
  timestamps: true,
  collection: 'contacts'
});

// Indexes
contactSchema.index({ phone_number: 1 }, { unique: true });
contactSchema.index({ email: 1 });
contactSchema.index({ name: 1 });

// Virtual for created_at (for backwards compatibility)
contactSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON
contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', contactSchema);

