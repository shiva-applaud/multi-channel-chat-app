<template>
  <div class="sessions-page">
    <div class="sessions-container">
      <header class="sessions-header">
        <div class="header-content">
          <h1>Chat Sessions</h1>
          <p class="subtitle">View and manage your conversation sessions</p>
        </div>
        <div class="header-actions">
          <button @click="goToChat" class="btn-back">
            ← Back to Chat
          </button>
          <button @click="createNewSession" class="btn-new-session">
            + New Session
          </button>
        </div>
      </header>

      <div class="sessions-content">
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Channel</label>
            <select v-model="selectedChannelId" @change="loadSessions">
              <option value="">All Channels</option>
              <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                {{ channel.name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>Type</label>
            <select v-model="selectedCommunicationType" @change="loadSessions">
              <option value="">All Types</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="voice">Voice Call</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select v-model="selectedStatus" @change="loadSessions">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <!-- Sessions List -->
        <div v-if="loading" class="loading">
          Loading sessions...
        </div>

        <div v-else-if="sessions.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>No sessions found</h3>
          <p>Start a new conversation to create a session</p>
        </div>

        <div v-else class="sessions-grid">
          <transition-group name="session-card" tag="div" class="grid-container">
            <div
              v-for="session in sessions"
              :key="session.id"
              class="session-card"
              @click="openSession(session)"
            >
              <div class="session-header-info">
                <h3>{{ session.title }}</h3>
                <span class="session-status" :class="session.status">
                  {{ session.status }}
                </span>
              </div>
              
              <div class="session-type-badge" :class="`type-${session.communication_type}`">
                {{ getTypeIcon(session.communication_type) }} {{ formatType(session.communication_type) }}
              </div>
              
              <p v-if="session.description" class="session-description">
                {{ session.description }}
              </p>
              
              <div class="session-meta">
                <div class="meta-item">
                  <span class="meta-icon">💬</span>
                  <span>{{ session.message_count }} messages</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">🕐</span>
                  <span>{{ formatDate(session.last_message_at) }}</span>
                </div>
              </div>
              
              <div class="session-channel">
                <span>📱 {{ getChannelName(session.channel_id) }}</span>
              </div>
              
              <div class="session-actions" @click.stop>
                <button @click="archiveSession(session)" class="btn-icon" title="Archive">
                  📦
                </button>
                <button @click="deleteSession(session)" class="btn-icon" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- New Session Dialog -->
    <transition name="dialog-fade">
      <div v-if="showNewSessionDialog" class="dialog-overlay" @click="showNewSessionDialog = false">
        <div class="dialog-content" @click.stop>
          <h2>Create New Session</h2>
          
          <div class="form-group">
            <label>Channel *</label>
            <select v-model="newSession.channel_id" required>
              <option value="">Select a channel</option>
              <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                {{ channel.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Type *</label>
            <select v-model="newSession.communication_type" required>
              <option value="">Select type</option>
              <option value="whatsapp">💚 WhatsApp</option>
              <option value="sms">💬 SMS</option>
              <option value="voice">📞 Voice Call</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Title</label>
            <input
              v-model="newSession.title"
              type="text"
              placeholder="Session title (optional)"
            />
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="newSession.description"
              placeholder="Session description (optional)"
              rows="3"
            ></textarea>
          </div>
          
          <div class="dialog-actions">
            <button @click="showNewSessionDialog = false" class="btn-secondary">
              Cancel
            </button>
            <button @click="saveNewSession" class="btn-primary" :disabled="!newSession.channel_id || !newSession.communication_type">
              Create Session
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Sessions',
  data() {
    return {
      sessions: [],
      channels: [],
      loading: false,
      selectedChannelId: '',
      selectedCommunicationType: '',
      selectedStatus: '',
      showNewSessionDialog: false,
      newSession: {
        channel_id: '',
        communication_type: '',
        title: '',
        description: ''
      }
    };
  },
  mounted() {
    this.loadChannels();
    this.loadSessions();
  },
  methods: {
    async loadChannels() {
      try {
        const response = await axios.get('http://localhost:3000/api/channels');
        this.channels = response.data;
      } catch (error) {
        console.error('Error loading channels:', error);
      }
    },
    async loadSessions() {
      try {
        this.loading = true;
        const params = {};
        if (this.selectedChannelId) params.channel_id = this.selectedChannelId;
        if (this.selectedCommunicationType) params.communication_type = this.selectedCommunicationType;
        if (this.selectedStatus) params.status = this.selectedStatus;
        
        const response = await axios.get('http://localhost:3000/api/sessions', { params });
        this.sessions = response.data;
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        this.loading = false;
      }
    },
    openSession(session) {
      // Navigate to chat page with session ID and communication type
      this.$router.push({
        path: '/chat',
        query: {
          channel_id: session.channel_id,
          session_id: session.id,
          communication_type: session.communication_type
        }
      }).catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    },
    createNewSession() {
      this.newSession = {
        channel_id: this.selectedChannelId || '',
        communication_type: this.selectedCommunicationType || '',
        title: '',
        description: ''
      };
      this.showNewSessionDialog = true;
    },
    async saveNewSession() {
      try {
        await axios.post('http://localhost:3000/api/sessions', this.newSession);
        this.showNewSessionDialog = false;
        this.loadSessions();
      } catch (error) {
        console.error('Error creating session:', error);
        alert('Failed to create session');
      }
    },
    async archiveSession(session) {
      if (!confirm(`Archive session "${session.title}"?`)) return;
      
      try {
        await axios.post(`http://localhost:3000/api/sessions/${session.id}/archive`);
        this.loadSessions();
      } catch (error) {
        console.error('Error archiving session:', error);
        alert('Failed to archive session');
      }
    },
    async deleteSession(session) {
      if (!confirm(`Delete session "${session.title}" and all its messages?`)) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/sessions/${session.id}?delete_messages=true`);
        this.loadSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete session');
      }
    },
    getChannelName(channelId) {
      const channel = this.channels.find(c => c.id === channelId);
      return channel ? channel.name : 'Unknown Channel';
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    },
    goToChat() {
      this.$router.push('/chat').catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    },
    formatType(type) {
      const types = {
        'whatsapp': 'WhatsApp',
        'sms': 'SMS',
        'voice': 'Voice Call'
      };
      return types[type] || type;
    },
    getTypeIcon(type) {
      const icons = {
        'whatsapp': '💚',
        'sms': '💬',
        'voice': '📞'
      };
      return icons[type] || '📱';
    }
  }
};
</script>

<style scoped>
.sessions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%);
  padding: 2rem;
  animation: fadeInBg 0.6s ease;
}

@keyframes fadeInBg {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sessions-container {
  max-width: 1400px;
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

.sessions-header {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  color: #2c5f7d;
}

.subtitle {
  margin: 0;
  color: rgba(0, 0, 0, 0.7);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-back,
.btn-new-session {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-size: 0.95rem;
}

.btn-back {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  color: #2c5f7d;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(-5px);
}

.btn-new-session {
  background: rgba(44, 95, 125, 0.9);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.3);
}

.btn-new-session:hover {
  background: rgba(44, 95, 125, 1);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(44, 95, 125, 0.4);
}

.sessions-content {
  padding: 2rem;
}

.filters {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c5f7d;
  font-size: 0.9rem;
}

.filter-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-group select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.15);
}

.loading,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #2c5f7d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.empty-state p {
  margin: 0;
  opacity: 0.7;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.session-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.session-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.8);
}

.session-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.session-header-info h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c5f7d;
  flex: 1;
}

.session-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.session-status.active {
  background: rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}

.session-status.archived {
  background: rgba(158, 158, 158, 0.2);
  color: #616161;
}

.session-status.closed {
  background: rgba(244, 67, 54, 0.2);
  color: #c62828;
}

.session-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0.5rem 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.session-type-badge.type-whatsapp {
  background: rgba(37, 211, 102, 0.15);
  border-color: rgba(37, 211, 102, 0.3);
  color: #25d366;
}

.session-type-badge.type-sms {
  background: rgba(33, 150, 243, 0.15);
  border-color: rgba(33, 150, 243, 0.3);
  color: #2196f3;
}

.session-type-badge.type-voice {
  background: rgba(156, 39, 176, 0.15);
  border-color: rgba(156, 39, 176, 0.3);
  color: #9c27b0;
}

.session-description {
  margin: 0 0 1rem;
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.session-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
}

.meta-icon {
  font-size: 1.1rem;
}

.session-channel {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 0.85rem;
  color: #2c5f7d;
  font-weight: 600;
}

.session-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-icon {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-content h2 {
  margin: 0 0 1.5rem;
  color: #2c5f7d;
  font-size: 1.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c5f7d;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.15);
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background: rgba(44, 95, 125, 0.9);
  color: white;
  box-shadow: 0 4px 20px rgba(44, 95, 125, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: rgba(44, 95, 125, 1);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  color: #2c5f7d;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* Transitions */
.session-card-enter-active {
  transition: all 0.4s ease;
}

.session-card-leave-active {
  transition: all 0.3s ease;
}

.session-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.session-card-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sessions-page {
    padding: 1rem;
  }

  .sessions-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .grid-container {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
  }
}
</style>

