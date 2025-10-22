#!/usr/bin/env node

/**
 * Twilio Configuration Checker
 * 
 * This script checks if Twilio is properly configured and provides
 * guidance on how to set up the required environment variables.
 */

const logger = require('../utils/logger');

function checkTwilioConfiguration() {
  console.log('🔍 Checking Twilio Configuration...\n');
  
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_SMS_AUTH_TOKEN',
    'TWILIO_WHATSAPP_NUMBER',
    'TWILIO_PHONE_NUMBER'
  ];
  
  const optionalVars = [
    'TWILIO_SMS_AUTH_TOKEN',
    'SERVER_URL'
  ];
  
  let allConfigured = true;
  
  console.log('📋 Required Environment Variables:');
  console.log('=====================================');
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && value !== 'your_account_sid_here' && value !== 'your_auth_token_here';
    
    if (isSet) {
      console.log(`✅ ${varName}: ${varName.includes('TOKEN') ? '***' + value.slice(-4) : value}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      allConfigured = false;
    }
  });
  
  console.log('\n📋 Optional Environment Variables:');
  console.log('=====================================');
  
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && value !== 'your_auth_token_here';
    
    if (isSet) {
      console.log(`✅ ${varName}: ${varName.includes('TOKEN') ? '***' + value.slice(-4) : value}`);
    } else {
      console.log(`⚠️  ${varName}: NOT SET (optional)`);
    }
  });
  
  console.log('\n📊 Configuration Status:');
  console.log('==========================');
  
  if (allConfigured) {
    console.log('✅ Twilio is properly configured!');
    console.log('🚀 You can now send real WhatsApp and SMS messages.');
  } else {
    console.log('❌ Twilio is not properly configured.');
    console.log('\n🔧 Setup Instructions:');
    console.log('=======================');
    console.log('1. Go to https://console.twilio.com/');
    console.log('2. Copy your Account SID and Auth Token');
    console.log('3. Set up your environment variables:');
    console.log('');
    console.log('   For .env file:');
    console.log('   TWILIO_ACCOUNT_SID=your_account_sid_here');
    console.log('   TWILIO_SMS_AUTH_TOKEN=your_auth_token_here');
    console.log('   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox number');
    console.log('   TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number');
    console.log('');
    console.log('   For Windows PowerShell:');
    console.log('   $env:TWILIO_ACCOUNT_SID="your_account_sid_here"');
    console.log('   $env:TWILIO_SMS_AUTH_TOKEN="your_auth_token_here"');
    console.log('   $env:TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"');
    console.log('   $env:TWILIO_PHONE_NUMBER="+1234567890"');
    console.log('');
    console.log('   For Linux/Mac:');
    console.log('   export TWILIO_ACCOUNT_SID="your_account_sid_here"');
    console.log('   export TWILIO_SMS_AUTH_TOKEN="your_auth_token_here"');
    console.log('   export TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"');
    console.log('   export TWILIO_PHONE_NUMBER="+1234567890"');
    console.log('');
    console.log('📱 WhatsApp Setup:');
    console.log('- For testing: Use Twilio Sandbox number +14155238886');
    console.log('- For production: Get a verified WhatsApp Business number');
    console.log('- Send "join <sandbox-code>" to +1 415 523 8886 to join sandbox');
    console.log('');
    console.log('📞 SMS Setup:');
    console.log('- Purchase a phone number from Twilio Console');
    console.log('- Set TWILIO_PHONE_NUMBER to your purchased number');
  }
  
  console.log('\n🔄 Current Status:');
  console.log('==================');
  console.log(`All required variables configured: ${allConfigured ? 'YES' : 'NO'}`);
  console.log(`Mode: ${allConfigured ? 'PRODUCTION' : 'MOCK'}`);
  
  if (!allConfigured) {
    console.log('\n⚠️  Note: Without proper configuration, all messaging will use mock mode.');
    console.log('   Messages will be logged but not actually sent via Twilio.');
  }
  
  return allConfigured;
}

// Run the check
if (require.main === module) {
  checkTwilioConfiguration();
}

module.exports = { checkTwilioConfiguration };
