/**
 * Environment Configuration Verification Script
 * Run this to verify your .env file is configured correctly
 */

require('dotenv').config({ path: './server/.env' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name, required = true) {
  const value = process.env[name];
  const exists = value && value.trim() !== '';
  
  if (exists) {
    // Mask sensitive values
    let displayValue = value;
    if (name.includes('TOKEN') || name.includes('SID')) {
      displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
    }
    log(`✅ ${name}: ${displayValue}`, 'green');
    return true;
  } else {
    if (required) {
      log(`❌ ${name}: NOT SET (REQUIRED)`, 'red');
    } else {
      log(`⚠️  ${name}: NOT SET (optional)`, 'yellow');
    }
    return false;
  }
}

async function verifyTwilioConnection() {
  try {
    log('\n🔍 Testing Twilio Connection...', 'cyan');
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_SMS_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      log('❌ Cannot test Twilio: Missing credentials', 'red');
      return false;
    }
    
    // Try to require twilio from server directory
    let twilio;
    try {
      twilio = require('./server/node_modules/twilio');
    } catch (e) {
      twilio = require('twilio');
    }
    const client = twilio(accountSid, authToken);
    
    // Test by fetching account info
    const account = await client.api.accounts(accountSid).fetch();
    log(`✅ Twilio connection successful!`, 'green');
    log(`   Account Status: ${account.status}`, 'blue');
    log(`   Account Name: ${account.friendlyName || 'N/A'}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Twilio connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('     ENVIRONMENT CONFIGURATION VERIFICATION', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Check if .env file exists
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, 'server', '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found at: server/.env', 'red');
    log('\n📝 Please create the file using the guide in ENV_CONFIGURATION.md\n', 'yellow');
    process.exit(1);
  }
  
  log('✅ .env file found at: server/.env', 'green');
  
  // Server Configuration
  log('\n📦 Server Configuration:', 'cyan');
  checkEnvVar('PORT', false);
  checkEnvVar('NODE_ENV', false);
  checkEnvVar('SERVER_URL', false);
  checkEnvVar('CLIENT_URL', false);
  
  // MongoDB Configuration
  log('\n🗄️  MongoDB Configuration:', 'cyan');
  checkEnvVar('MONGODB_URI', true);
  
  // Twilio Configuration
  log('\n📱 Twilio Configuration:', 'cyan');
  const hasAccountSid = checkEnvVar('TWILIO_ACCOUNT_SID', true);
  const hasAuthToken = checkEnvVar('TWILIO_SMS_AUTH_TOKEN', true);
  const hasPhoneNumber = checkEnvVar('TWILIO_PHONE_NUMBER', true);
  checkEnvVar('TWILIO_USER_SID', false);
  
  // Feature Flags
  log('\n⚙️  Feature Configuration:', 'cyan');
  checkEnvVar('MOCK_MODE', false);
  checkEnvVar('AI_RESPONSES_ENABLED', false);
  checkEnvVar('AI_RESPONSE_DELAY', false);
  checkEnvVar('AI_PROVIDER', false);
  
  // Logging
  log('\n📝 Logging Configuration:', 'cyan');
  checkEnvVar('LOG_LEVEL', false);
  
  // Verify Twilio Connection
  if (hasAccountSid && hasAuthToken) {
    const twilioOk = await verifyTwilioConnection();
    
    if (twilioOk && hasPhoneNumber) {
      log('\n🎉 ALL CHECKS PASSED!', 'green');
      log('\nYour Twilio configuration is ready:', 'cyan');
      log(`   📞 Phone Number: ${process.env.TWILIO_PHONE_NUMBER}`, 'blue');
      log(`   🔧 Mock Mode: ${process.env.MOCK_MODE || 'false'}`, 'blue');
      log(`   🤖 AI Responses: ${process.env.AI_RESPONSES_ENABLED || 'false'}`, 'blue');
      
      log('\n✅ You can now start your server with: npm run dev', 'green');
      log('✅ Messages will be sent via real Twilio API', 'green');
      log('\n📚 See COMPLETE_TWILIO_FLOW.md for usage guide\n', 'cyan');
    }
  } else {
    log('\n⚠️  Configuration incomplete. Please fix the issues above.\n', 'yellow');
    process.exit(1);
  }
}

// Run verification
main().catch(error => {
  log(`\n❌ Verification failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

