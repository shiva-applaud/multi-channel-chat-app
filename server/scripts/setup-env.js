#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps you create the .env file with proper configuration
 */

const fs = require('fs');
const path = require('path');

const envTemplate = `# ============================================
# Multi-Channel Chat App - Environment Configuration
# ============================================

# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=development
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:8080

# ============================================
# MongoDB Configuration
# ============================================
MONGODB_URI=mongodb://localhost:27017/multi_channel_chat

# ============================================
# Twilio Configuration
# ============================================
# Get these from https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_account_sid_here

# SMS Configuration
TWILIO_SMS_AUTH_TOKEN=your_sms_auth_token_here
TWILIO_PHONE_NUMBER=+15703251809

# WhatsApp Configuration
TWILIO_WHATSAPP_AUTH_TOKEN=your_whatsapp_auth_token_here
# For Twilio Sandbox: use whatsapp:+14155238886
# For production: use your verified WhatsApp Business number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ============================================
# Twilio Webhooks (for ngrok or production)
# ============================================
# SMS_WEBHOOK_URL=https://yourdomain.com/api/webhooks/sms
# VOICE_WEBHOOK_URL=https://yourdomain.com/api/webhooks/voice
# WHATSAPP_WEBHOOK_URL=https://yourdomain.com/api/webhooks/whatsapp

# ============================================
# Mock Mode Configuration
# ============================================
# Set to false to use real Twilio API
# Set to true for testing without sending real messages
MOCK_MODE=false

# ============================================
# AI Response Configuration
# ============================================
AI_RESPONSES_ENABLED=true
AI_RESPONSE_DELAY=2000
AI_PROVIDER=mock

# ============================================
# External Chat API Configuration
# ============================================
# For external AI chat service
EXTERNAL_CHAT_API_URL=http://localhost:8100/chat

# ============================================
# Logging Configuration
# ============================================
LOG_LEVEL=info

# ============================================
# Optional: OpenAI Integration
# ============================================
# OPENAI_API_KEY=sk-your-key-here
# OPENAI_MODEL=gpt-4

# ============================================
# Optional: Anthropic Integration
# ============================================
# ANTHROPIC_API_KEY=your-key-here

# ============================================
# Development Tools
# ============================================
# Enable detailed logging for debugging
DEBUG_MODE=true

# ============================================
# Security Configuration
# ============================================
# JWT_SECRET=your-jwt-secret-here
# SESSION_SECRET=your-session-secret-here`;

function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  console.log('🔧 Setting up .env file...\n');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('   Do you want to overwrite it? (y/N)');
    
    // For now, just show the content that would be created
    console.log('\n📄 Content that would be written to .env:');
    console.log('==========================================');
    console.log(envTemplate);
    return;
  }
  
  try {
    // Create the .env file
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    console.log('\n🔧 Next steps:');
    console.log('1. Open the .env file in your editor');
    console.log('2. Replace "your_account_sid_here" with your Twilio Account SID');
    console.log('3. Replace "your_sms_auth_token_here" with your SMS Auth Token');
    console.log('4. Replace "your_whatsapp_auth_token_here" with your WhatsApp Auth Token');
    console.log('5. Update other values as needed');
    console.log('6. Restart your server');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('\n📄 Manual setup:');
    console.log('1. Create a file named ".env" in the server directory');
    console.log('2. Copy the content below into the file:');
    console.log('\n==========================================');
    console.log(envTemplate);
  }
}

function showSetupInstructions() {
  console.log('🚀 Environment Setup Instructions');
  console.log('================================\n');
  
  console.log('📋 Step 1: Get Twilio Credentials');
  console.log('1. Go to https://console.twilio.com/');
  console.log('2. Copy your Account SID and Auth Token');
  console.log('3. Note your phone number (or purchase one)\n');
  
  console.log('📋 Step 2: Create .env File');
  console.log('Run this script: node scripts/setup-env.js\n');
  
  console.log('📋 Step 3: Configure Variables');
  console.log('Open server/.env and update:');
  console.log('- TWILIO_ACCOUNT_SID=your_actual_sid');
  console.log('- TWILIO_SMS_AUTH_TOKEN=your_actual_token');
  console.log('- TWILIO_PHONE_NUMBER=your_phone_number');
  console.log('- TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 (for sandbox)\n');
  
  console.log('📋 Step 4: Test Configuration');
  console.log('1. Restart your server: npm run dev');
  console.log('2. Check logs for: "Twilio client initialized successfully"');
  console.log('3. Run: node scripts/check-twilio-config.js\n');
  
  console.log('📱 WhatsApp Sandbox Setup:');
  console.log('1. Go to Twilio Console → Messaging → WhatsApp Sandbox');
  console.log('2. Set webhook URL: https://yourdomain.com/api/webhooks/whatsapp');
  console.log('3. Send "join <sandbox-code>" to +1 415 523 8886');
  console.log('4. Test by sending a message to your sandbox number\n');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showSetupInstructions();
  } else {
    createEnvFile();
  }
}

module.exports = { createEnvFile, showSetupInstructions };
