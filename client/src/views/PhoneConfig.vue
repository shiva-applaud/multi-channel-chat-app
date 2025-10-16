<!-- eslint-disable no-unused-vars -->
<template>
  <div class="phone-config">
    <div class="config-container">
      <header class="config-header">
        <h1>Configure Phone Number</h1>
        <p class="subtitle">Set up your communication channels</p>
        <button @click="goBack" class="btn-back">
          ← Back
        </button>
      </header>

      <div class="config-content">
        <!-- Single Configuration Form -->
        <div class="config-form-section">
          <div class="form-header">
            <h2>Create New Channel</h2>
            <p>Configure a phone number for your communication channel</p>
          </div>

          <form @submit.prevent="createChannel" class="config-form">
            <div class="form-group">
              <label>Country *</label>
              <input
                v-model="channelConfig.country"
                type="text"
                placeholder="e.g., USA, India, UK"
                required
              />
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <div class="phone-number-display">
                <span v-if="channelConfig.phone_number" class="phone-number-bold">
                  {{ channelConfig.phone_number }}
                </span>
                <span v-else class="phone-number-placeholder">
                  Click "Generate" to create a phone number
                </span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="resetForm" class="btn-secondary" :disabled="isGenerating">
                Clear
              </button>
              <button type="button" @click="generateAndShowNumber" class="btn-primary" :disabled="isGenerating">
                {{ isGenerating ? 'Generating...' : 'Generate Phone Number' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Notification -->
    <transition name="slide-up">
      <div v-if="showSuccessNotification" class="success-notification">
        <div class="notification-content">
          <span class="notification-icon">✓</span>
          <span class="notification-text">Phone number created successfully!</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PhoneConfig',
  data() {
    return {
      channelConfig: {
        country: '',
        phone_number: '',
        countryCode: '',
        twilioSid: null,
        channelId: null
      },
      channels: [],
      showSuccessNotification: false,
      isGenerating: false
    };
  },
  mounted() {
    // Don't auto-generate on mount
  },
  methods: {
    async generatePhoneNumber() {
      // Step 1: Call backend API to generate phone number via Twilio
      // Backend will: call Twilio API -> get number -> store in DB -> return to FE
      try {
        this.isGenerating = true;
        
        const response = await axios.post('http://localhost:3000/api/channels/generate-phone-number', {
          country: this.channelConfig.country,
          name: `${this.channelConfig.country} Number`,
          type: 'whatsapp'
        });
        
        // Step 2: Store the response data (channel is already created in DB)
        this.channelConfig.phone_number = response.data.phoneNumber;
        this.channelConfig.countryCode = response.data.countryCode;
        this.channelConfig.twilioSid = response.data.twilioSid;
        this.channelConfig.channelId = response.data.id;
        
        // Show message if it's a mock number
        if (response.data.isMock) {
          console.log('Note: Using mock phone number. Configure Twilio credentials for real numbers.');
        }
        
        console.log('✓ Phone number generated and stored:', response.data.phoneNumber);
        console.log('✓ Channel ID:', response.data.id);
        
        return response.data;
      } catch (error) {
        console.error('Error generating phone number:', error);
        alert('Failed to generate phone number: ' + (error.response?.data?.details || error.message));
        throw error;
      } finally {
        this.isGenerating = false;
      }
    },
    getCountryCode(country) {
      const countryCodes = {
        'usa': '+1',
        'canada': '+1',
        'uk': '+44',
        'india': '+91',
        'australia': '+61',
        'japan': '+81',
        'china': '+86',
        'germany': '+49',
        'france': '+33',
        'brazil': '+55',
        'mexico': '+52',
        'spain': '+34',
        'italy': '+39',
        'russia': '+7',
        'korea': '+82',
        'south korea': '+82',
        'south africa': '+27'
      };
      
      const normalizedCountry = country.toLowerCase().trim();
      return countryCodes[normalizedCountry] || '+1';
    },
    extractCountryCode(phoneNumber) {
      if (!phoneNumber) return '';
      // Extract country code from phone number (first 1-3 digits after +)
      const match = phoneNumber.match(/^\+?(\d{1,3})/);
      return match ? `+${match[1]}` : '';
    },
    async generateAndShowNumber() {
      if (!this.channelConfig.country) {
        alert('Please enter a country first');
        return;
      }

      try {
        // Step 1: Generate the phone number via API
        // This will: call backend -> backend calls Twilio -> backend stores in DB -> returns to FE
        await this.generatePhoneNumber();
        
        // Step 2: Show success notification
        this.showSuccessNotification = true;
        
        // Step 3: Wait a moment for user to see the number, then redirect to chat
        setTimeout(() => {
          this.showSuccessNotification = false;
          // Redirect to chat page where user can see their new channel
          this.$router.push('/chat');
        }, 2000);
      } catch (error) {
        // Error already handled in generatePhoneNumber
      }
    },
    // Note: createChannel is no longer needed as the channel is created automatically
    // when generating the phone number in the new flow. Keeping this for backwards compatibility.
    async createChannelManually(channelData) {
      try {
        const response = await axios.post('http://localhost:3000/api/channels', channelData);
        console.log('Channel created manually:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error creating channel:', error);
        throw error;
      }
    },
    resetForm() {
      this.channelConfig = {
        country: '',
        phone_number: '',
        countryCode: '',
        twilioSid: null,
        channelId: null
      };
    },
    goBack() {
      this.$router.push('/chat').catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    },
    // eslint-disable-next-line no-unused-vars
    showNotification(message, type = 'info') {
      alert(message);
    }
  }
};
</script>

<style scoped>
.phone-config {
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%);
  padding: 2rem;
  overflow-y: auto;
  animation: fadeInBg 0.6s ease;
}

@keyframes fadeInBg {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.config-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-header {
  padding: 3rem 2rem 2rem;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  color: #2c5f7d;
  position: relative;
}

.config-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  opacity: 0.8;
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.7);
}

.btn-back {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #2c5f7d;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.btn-back:active {
  transform: translateX(-3px) scale(0.98);
}

.config-content {
  padding: 2rem;
  animation: fadeInContent 0.6s ease 0.2s backwards;
}

@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-form-section {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  margin: 0 0 0.5rem;
  color: #2c5f7d;
  font-size: 1.75rem;
  font-weight: 700;
}

.form-header p {
  margin: 0;
  color: rgba(0, 0, 0, 0.6);
}

.config-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c5f7d;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.15);
  transform: scale(1.01);
}

.form-group select {
  cursor: pointer;
}

.phone-number-display {
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  min-height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.phone-number-bold {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c5f7d;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.phone-number-placeholder {
  color: rgba(0, 0, 0, 0.5);
  font-style: italic;
}

.form-group small {
  margin-top: 0.5rem;
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.btn-primary {
  background: rgba(44, 95, 125, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.3);
}

.btn-primary:hover {
  background: rgba(44, 95, 125, 1);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(44, 95, 125, 0.4);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:disabled:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #2c5f7d;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.btn-secondary:active {
  transform: translateY(0);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary:disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Success Notification */
.success-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(76, 175, 80, 0.95);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 15px 50px rgba(76, 175, 80, 0.5);
  z-index: 1000;
  animation: pulse 0.5s ease-in-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-icon {
  font-size: 1.5rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  color: #4caf50;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.notification-text {
  font-weight: 600;
  font-size: 1rem;
}

@keyframes pulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
}

.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20%);
}

@media (max-width: 768px) {
  .phone-config {
    padding: 1rem;
  }

  .config-header {
    padding: 2rem 1rem 1.5rem;
  }

  .config-header h1 {
    font-size: 1.75rem;
  }

  .btn-back {
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .config-content {
    padding: 1rem;
  }

  .config-form-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
