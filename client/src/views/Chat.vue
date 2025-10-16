<template>
  <div class="chat-container">
    <!-- Channel Type Tabs -->
    <div class="channel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.type"
        :class="['tab-btn', { active: activeChannelType === tab.type }]"
        @click="activeChannelType = tab.type"
      >
        <span class="tab-icon">
          <svg v-if="tab.icon === 'whatsapp-logo'" class="whatsapp-logo" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span v-else>{{ tab.icon }}</span>
        </span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="getChannelCountByType(tab.type) > 0" class="tab-badge">
          {{ getChannelCountByType(tab.type) }}
        </span>
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="sidebar">
      <div class="sidebar-header">
        <h2>{{ getActiveTabLabel() }}</h2>
        <div class="header-actions">
          <button @click="goToSessions" class="btn-sessions" title="View Sessions">
            📋
          </button>
          <button @click="goToConfig" class="btn-config" title="Configure Phone Numbers">
            ⚙️
          </button>
          <button @click="showNewChannelDialog = true" class="btn-new" title="Add Channel">
            +
          </button>
        </div>
      </div>
      
      <div class="channel-list">
        <transition-group name="list" tag="div">
          <div
            v-for="(channel, index) in channels"
            :key="channel.id"
            :class="['channel-item', { active: currentChannel && currentChannel.id === channel.id }]"
            :style="{ 'animation-delay': `${index * 0.05}s` }"
            @click="selectChannel(channel)"
          >
          <div class="channel-icon">
            <svg v-if="activeChannelType === 'whatsapp'" class="whatsapp-logo-sidebar" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span v-else>{{ getActiveTabIcon() }}</span>
          </div>
          <div class="channel-info">
            <div class="channel-name">{{ channel.name }}</div>
            <div class="channel-number">{{ formatPhoneNumber(channel.phone_number) }}</div>
          </div>
          </div>
        </transition-group>
        
        <div v-if="channels.length === 0" class="empty-state">
          <p>No phone numbers yet</p>
          <button @click="goToConfig" class="btn-create">
            Configure Phone Number
          </button>
        </div>
      </div>
      </div>
      
      <div class="chat-area">
        <!-- Voice Call Interface -->
        <transition name="slide-fade" mode="out-in">
          <div v-if="currentChannel && activeChannelType === 'voice'" class="call-interface" key="voice-interface">
          <div class="call-header">
            <h3>{{ currentChannel.name }}</h3>
          </div>
          
          <div class="call-content">
            <div class="call-icon-large">📞</div>
            <div class="phone-number-display-large">
              {{ formatPhoneNumber(currentChannel.phone_number) }}
            </div>
            <div class="recipient-input-section">
              <label>📱 Your Number:</label>
              <input 
                v-model="userPhoneNumber" 
                type="tel" 
                placeholder="+1234567890"
                class="recipient-number-input-call"
                @blur="saveUserPhoneNumber"
                title="Enter your phone number to identify yourself"
              />
            </div>
            <button @click="makeCall" class="btn-call" :disabled="!userPhoneNumber">
              <span class="call-button-icon">📞</span>
              Call Twilio Number
            </button>
            <p v-if="!userPhoneNumber" class="call-hint">Enter your number above to simulate a call</p>
          </div>
          </div>

          <!-- Chat Interface (WhatsApp & SMS) -->
          <div v-else-if="currentChannel" class="chat-content" key="chat-content">
          <div class="chat-header">
            <div class="channel-details">
              <div class="header-top-row">
                <h3>{{ currentChannel.name }}</h3>
                <span v-if="currentSessionId" class="session-indicator">
                  📋 Session View
                  <button @click="clearSession" class="btn-clear-session" title="View all messages">
                    ✕
                  </button>
                </span>
              </div>
              <div class="channel-info-row">
                <span class="channel-type">
                  <svg v-if="activeChannelType === 'whatsapp'" class="whatsapp-logo-header" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span v-else>{{ getActiveTabIcon() }}</span>
                  {{ getActiveTabLabel() }}
                </span>
                <div class="recipient-input-group">
                  <label>📱 Your Number:</label>
                  <input 
                    v-model="userPhoneNumber" 
                    type="tel" 
                    placeholder="+1234567890"
                    class="recipient-number-input"
                    @blur="saveUserPhoneNumber"
                    title="Enter your phone number to identify yourself"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div class="messages" ref="messages">
            <transition-group name="message-slide" tag="div">
              <div
                v-for="message in filteredMessages"
                :key="message.id"
                :class="['message', message.sender === 'user' ? 'sent' : 'received']"
              >
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">
                {{ formatTime(message.created_at) }}
              </div>
              </div>
            </transition-group>
          </div>
          
          <div class="message-input">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              :placeholder="'Send a message via ' + getActiveTabLabel()"
              type="text"
            />
            <button @click="sendMessage" :disabled="!newMessage.trim()">
              Send
            </button>
          </div>
          </div>
          
          <div v-else class="empty-chat" key="empty-chat">
            <h2>Select a channel to start {{ activeChannelType === 'voice' ? 'calling' : 'chatting' }}</h2>
          </div>
        </transition>
      </div>
    </div>
    
    <!-- Available Numbers Dialog -->
    <transition name="dialog-fade">
      <div v-if="showNewChannelDialog" class="dialog-overlay" @click="showNewChannelDialog = false">
        <div class="dialog numbers-dialog" @click.stop>
        <div class="dialog-header">
          <h3>Available Phone Numbers</h3>
          <button @click="showNewChannelDialog = false" class="btn-close">✕</button>
        </div>
        
        <div v-if="channels.length > 0" class="numbers-list">
          <div
            v-for="channel in channels"
            :key="channel.id"
            class="number-card"
          >
            <div class="number-info">
              <div class="number-name">{{ channel.name }}</div>
              <div class="number-display">{{ formatPhoneNumber(channel.phone_number) }}</div>
              <div class="number-country">{{ channel.country_code }}</div>
            </div>
            <div class="number-actions">
              <button @click="selectChannelFromDialog(channel)" class="btn-select">
                Select
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-numbers">
          <div class="empty-icon">📱</div>
          <p>No phone numbers configured yet</p>
          <button @click="goToConfigFromDialog" class="btn-configure">
            Configure New Number
          </button>
        </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'Chat',
  data() {
    return {
      channels: [],
      currentChannel: null,
      currentSessionId: null,
      messages: [],
      newMessage: '',
      userPhoneNumber: '', // User's phone number (sends FROM this TO Twilio)
      socket: null,
      showNewChannelDialog: false,
      activeChannelType: 'whatsapp',
      tabs: [
        { type: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp-logo' },
        { type: 'sms', label: 'SMS', icon: '💬' },
        { type: 'voice', label: 'Voice Call', icon: '📞' }
      ],
    };
  },
  computed: {
    filteredMessages() {
      // Filter messages by active communication type
      return this.messages.filter(message => {
        // Show message if it matches current type or has no type (legacy messages)
        return !message.communication_type || message.communication_type === this.activeChannelType;
      });
    }
  },
  watch: {
    activeChannelType() {
      // When tab changes, clear session_id (unless we came from sessions page with that type)
      // This ensures that switching tabs shows all messages for that type, not a specific session
      if (this.currentSessionId && this.$route.query.communication_type !== this.activeChannelType) {
        this.currentSessionId = null;
      }
      
      // Reload messages for current channel and type
      if (this.currentChannel) {
        this.loadMessagesForCurrentType();
      }
    }
  },
  mounted() {
    this.connectSocket();
    this.loadChannels();
    this.loadUserPhoneNumber();
    
    // Check if session_id is provided in query params
    if (this.$route.query.session_id) {
      this.currentSessionId = this.$route.query.session_id;
    }
    
    // Check if communication_type is provided in query params (from sessions page)
    if (this.$route.query.communication_type) {
      this.activeChannelType = this.$route.query.communication_type;
    }
    
    // Check if channel_id is provided in query params
    if (this.$route.query.channel_id) {
      setTimeout(() => {
        const channel = this.channels.find(c => c.id === this.$route.query.channel_id);
        if (channel) {
          this.selectChannel(channel);
        }
      }, 500);
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
    connectSocket() {
      this.socket = io('http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
      });
      
      this.socket.on('new_message', (message) => {
        if (this.currentChannel && message.channel_id === this.currentChannel.id) {
          // Only add the message if it doesn't already exist (prevent duplicates)
          const messageExists = this.messages.some(m => m.id === message.id);
          if (!messageExists) {
            this.messages.push(message);
            // Only scroll if the message is for the current active tab
            if (!message.communication_type || message.communication_type === this.activeChannelType) {
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            }
          }
        }
      });
    },
    async loadChannels() {
      try {
        const response = await fetch('http://localhost:3000/api/channels');
        this.channels = await response.json();
      } catch (error) {
        console.error('Error loading channels:', error);
      }
    },
    async selectChannel(channel) {
      this.currentChannel = channel;
      
      if (this.socket) {
        this.socket.emit('join_channel', channel.id);
      }
      
      await this.loadMessagesForCurrentType();
    },
    async loadMessagesForCurrentType() {
      if (!this.currentChannel) return;
      
      try {
        let url = `http://localhost:3000/api/messages/channel/${this.currentChannel.id}`;
        
        // If session_id is specified, filter by session
        if (this.currentSessionId) {
          url += `?session_id=${this.currentSessionId}`;
        }
        
        const response = await fetch(url);
        this.messages = await response.json();
        this.messages.reverse(); // Display oldest first
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.currentChannel) return;
      
      if (!this.userPhoneNumber) {
        alert('⚠️ Please enter your phone number first!');
        return;
      }
      
      const message = {
        channel_id: this.currentChannel.id,
        session_id: this.currentSessionId || undefined, // Include session_id if available
        content: this.newMessage,
        sender: 'user',
        type: 'text',
        communication_type: this.activeChannelType, // Add the active communication type
        user_phone_number: this.userPhoneNumber, // User's number (FROM)
        twilio_number: this.currentChannel.phone_number // Twilio number (TO)
      };
      
      try {
        const response = await fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        const data = await response.json();
        
        // Update session_id if a new session was created
        if (!this.currentSessionId && data.session_id) {
          this.currentSessionId = data.session_id;
        }
        
        this.newMessage = '';
      } catch (error) {
        console.error('Error sending message:', error);
        alert('❌ Failed to send message: ' + (error.message || 'Unknown error'));
      }
    },
    selectChannelFromDialog(channel) {
      this.showNewChannelDialog = false;
      this.selectChannel(channel);
    },
    goToConfigFromDialog() {
      this.showNewChannelDialog = false;
      this.$router.push('/phone-config');
    },
    getChannelIcon(type) {
      const icons = {
        whatsapp: 'whatsapp-logo',
        sms: '💬',
        voice: '📞'
      };
      return icons[type] || '📱';
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    scrollToBottom() {
      const container = this.$refs.messages;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    goToConfig() {
      this.$router.push('/phone-config').catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    },
    goToSessions() {
      this.$router.push('/sessions').catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    },
    clearSession() {
      // Clear the session filter and show all messages for the current channel and type
      this.currentSessionId = null;
      this.loadMessagesForCurrentType();
    },
    getChannelCountByType() {
      // Show total channel count for each tab since all numbers work for all types
      return this.channels.length;
    },
    getActiveTabLabel() {
      const tab = this.tabs.find(t => t.type === this.activeChannelType);
      return tab ? tab.label : 'Channels';
    },
    getActiveTabIcon() {
      if (this.activeChannelType === 'whatsapp') {
        return 'whatsapp-logo';
      }
      const tab = this.tabs.find(t => t.type === this.activeChannelType);
      return tab ? tab.icon : '📱';
    },
    formatPhoneNumber(number) {
      if (!number) return '';
      // Format phone number for better display
      return number.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2-$3-$4');
    },
    async makeCall() {
      if (!this.currentChannel || !this.userPhoneNumber) {
        alert('⚠️ Please enter your phone number first!');
        return;
      }
      
      const confirmCall = confirm(`📞 Simulate call from your number?\n\nFrom: ${this.userPhoneNumber}\nTo: ${this.currentChannel.phone_number}\n\nNote: This will simulate an incoming call.`);
      
      if (!confirmCall) return;
      
      try {
        const response = await fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel_id: this.currentChannel.id,
            session_id: this.currentSessionId || undefined,
            content: `Voice call from ${this.userPhoneNumber}`,
            sender: 'user',
            type: 'call',
            communication_type: 'voice',
            user_phone_number: this.userPhoneNumber,
            twilio_number: this.currentChannel.phone_number
          })
        });
        
        const data = await response.json();
        
        if (data.id) {
          alert(`✅ Call simulated successfully!\n\nFrom: ${this.userPhoneNumber}\nTo: ${this.currentChannel.phone_number}`);
        }
      } catch (error) {
        console.error('Error simulating call:', error);
        alert('❌ Failed to simulate call: ' + (error.message || 'Unknown error'));
      }
    },
    saveUserPhoneNumber() {
      // Save user's phone number to localStorage
      if (this.userPhoneNumber) {
        localStorage.setItem('userPhoneNumber', this.userPhoneNumber);
        console.log('User phone number saved:', this.userPhoneNumber);
      }
    },
    loadUserPhoneNumber() {
      // Load user's phone number from localStorage
      const saved = localStorage.getItem('userPhoneNumber');
      if (saved) {
        this.userPhoneNumber = saved;
        console.log('User phone number loaded:', this.userPhoneNumber);
      }
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%);
}

.channel-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1rem;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 100;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: #2c5f7d;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
  animation: tab-activate 0.3s ease;
}

@keyframes tab-activate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1.02);
  }
}

.tab-icon {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.whatsapp-logo {
  width: 1.5rem;
  height: 1.5rem;
}

.whatsapp-logo-sidebar {
  width: 2rem;
  height: 2rem;
  color: #25D366;
}

.whatsapp-logo-header {
  width: 1.25rem;
  height: 1.25rem;
  color: #25D366;
  margin-right: 0.25rem;
}

.tab-label {
  font-weight: 600;
}

.tab-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #ff5252;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 1.5rem;
  text-align: center;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-header h2 {
  font-size: 1.5rem;
  color: #2c5f7d;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-new,
.btn-config {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #2c5f7d;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.btn-config {
  background: rgba(255, 255, 255, 0.35);
}

.btn-sessions {
  background: rgba(255, 255, 255, 0.35);
  font-size: 1.3rem;
}

.btn-new:hover,
.btn-config:hover,
.btn-sessions:hover {
  transform: scale(1.1) rotate(90deg);
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.btn-new:active,
.btn-config:active,
.btn-sessions:active {
  transform: scale(0.95);
}

.channel-list {
  flex: 1;
  overflow-y: auto;
}

.channel-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  margin: 0.25rem 0.5rem;
  border-radius: 10px;
  opacity: 0;
  animation: slideInLeft 0.4s ease forwards;
}

.channel-item:hover {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transform: translateX(5px);
}

.channel-item.active {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.channel-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.channel-info {
  flex: 1;
}

.channel-name {
  font-weight: 600;
  color: #111;
  margin-bottom: 0.25rem;
}

.channel-number {
  font-size: 0.875rem;
  color: #666;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.btn-create {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.channel-details h3 {
  margin-bottom: 0.25rem;
}

.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.session-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(135, 206, 235, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c5f7d;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.btn-clear-session {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #2c5f7d;
  transition: all 0.2s ease;
  padding: 0;
  line-height: 1;
}

.btn-clear-session:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  transform: scale(1.1);
}

.btn-clear-session:active {
  transform: scale(0.95);
}

.channel-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.channel-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #667eea;
  border-radius: 12px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.recipient-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.recipient-input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c5f7d;
  white-space: nowrap;
}

.recipient-number-input {
  border: 1px solid rgba(135, 206, 235, 0.5);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.8);
  color: #2c5f7d;
  min-width: 150px;
  transition: all 0.3s ease;
}

.recipient-number-input:focus {
  outline: none;
  border-color: #87CEEB;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 10px rgba(135, 206, 235, 0.3);
}

.recipient-number-input::placeholder {
  color: rgba(44, 95, 125, 0.5);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.2);
}

.message {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.message.sent {
  align-items: flex-end;
}

.message.received {
  align-items: flex-start;
}

.message-content {
  max-width: 60%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.sent .message-content {
  background: #667eea;
  color: white;
}

.message.received .message-content {
  background: white;
  color: #111;
}

.message-time {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}

.message-input {
  display: flex;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
}

.message-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-input input:focus {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transform: scale(1.01);
}

.message-input button {
  margin-left: 1rem;
  padding: 0.75rem 2rem;
  background: rgba(44, 95, 125, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-input button:hover:not(:disabled) {
  background: rgba(44, 95, 125, 1);
  box-shadow: 0 4px 15px rgba(44, 95, 125, 0.3);
  transform: translateY(-2px) scale(1.05);
}

.message-input button:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.message-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 500;
}

/* Call Interface Styles */
.call-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.call-header {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

.call-header h3 {
  margin: 0;
  color: #2c5f7d;
  font-size: 1.5rem;
  font-weight: 600;
}

.call-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 2rem;
}

.call-icon-large {
  font-size: 6rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: #2c5f7d;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 50px rgba(44, 95, 125, 0.3);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    box-shadow: 0 15px 50px rgba(44, 95, 125, 0.3), 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 15px 50px rgba(44, 95, 125, 0.3), 0 0 0 30px rgba(255, 255, 255, 0);
  }
}

.phone-number-display-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c5f7d;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.btn-call {
  padding: 1.5rem 4rem;
  font-size: 1.5rem;
  font-weight: 700;
  background: rgba(76, 175, 80, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 35px rgba(76, 175, 80, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-call:hover {
  background: rgba(76, 175, 80, 1);
  border-color: rgba(255, 255, 255, 0.7);
  transform: scale(1.08);
  box-shadow: 0 15px 45px rgba(76, 175, 80, 0.6);
}

.btn-call:active {
  transform: scale(0.95);
}

.btn-call:disabled {
  background: rgba(158, 158, 158, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-call:disabled:hover {
  transform: none;
}

.call-button-icon {
  font-size: 2rem;
  animation: ring 1.5s infinite;
}

@keyframes ring {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-15deg);
  }
  20%, 40% {
    transform: rotate(15deg);
  }
  50% {
    transform: rotate(0deg);
  }
}

.recipient-input-section {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  animation: fadeInScale 0.5s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.recipient-input-section label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c5f7d;
}

.recipient-number-input-call {
  border: 2px solid rgba(135, 206, 235, 0.6);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2c5f7d;
  min-width: 250px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.recipient-number-input-call:focus {
  outline: none;
  border-color: #87CEEB;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 20px rgba(135, 206, 235, 0.4);
  transform: scale(1.05);
}

.recipient-number-input-call::placeholder {
  color: rgba(44, 95, 125, 0.5);
}

.call-hint {
  margin-top: 1rem;
  color: rgba(44, 95, 125, 0.7);
  font-size: 0.95rem;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(135, 206, 235, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.numbers-dialog {
  max-width: 600px;
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  margin: -2rem -2rem 0 -2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px 20px 0 0;
}

.dialog-header h3 {
  margin: 0;
  color: #2c5f7d;
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-close {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  color: #2c5f7d;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.1);
}

.dialog h3 {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-submit {
  background: #667eea;
  color: white;
}

/* Numbers Dialog Styles */
.numbers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.number-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.number-card:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.number-info {
  flex: 1;
}

.number-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c5f7d;
  margin-bottom: 0.5rem;
}

.number-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c5f7d;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.25rem;
}

.number-country {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.5);
}

.number-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-select {
  padding: 0.75rem 1.5rem;
  background: rgba(44, 95, 125, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-select:hover {
  background: rgba(44, 95, 125, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(44, 95, 125, 0.4);
}

.btn-select:active {
  transform: scale(0.98);
}

.empty-numbers {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-numbers p {
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.btn-configure {
  padding: 1rem 2rem;
  background: rgba(44, 95, 125, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-configure:hover {
  background: rgba(44, 95, 125, 1);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(44, 95, 125, 0.4);
}

.btn-configure:active {
  transform: scale(0.98);
}

/* Vue Transition Classes */
/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide fade transition for content switching */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Message transitions */
.message-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.message-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-slide-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Dialog transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active .dialog,
.dialog-fade-leave-active .dialog {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-fade-enter-from .dialog {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.dialog-fade-leave-to .dialog {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Number card stagger animation */
.number-card {
  animation: fadeInUp 0.4s ease forwards;
}

.number-card:nth-child(1) { animation-delay: 0s; }
.number-card:nth-child(2) { animation-delay: 0.05s; }
.number-card:nth-child(3) { animation-delay: 0.1s; }
.number-card:nth-child(4) { animation-delay: 0.15s; }
.number-card:nth-child(5) { animation-delay: 0.2s; }
.number-card:nth-child(n+6) { animation-delay: 0.25s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

