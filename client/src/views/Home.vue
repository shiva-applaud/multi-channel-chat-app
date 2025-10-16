<template>
  <div class="home">
    <div class="header">
      <h1>📱 Multi-Channel Chat</h1>
      <p>WhatsApp, SMS, and Voice Communication Platform</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="icon">💚</div>
        <h3>WhatsApp</h3>
        <p>Send and receive WhatsApp messages</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">💬</div>
        <h3>SMS</h3>
        <p>SMS messaging support</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">📞</div>
        <h3>Voice</h3>
        <p>Make voice calls</p>
      </div>
    </div>
    
    <div class="actions">
      <button @click="goToConfig" class="btn-primary">
        ⚙️ Configure Phone Numbers
      </button>
      <button @click="goToSessions" class="btn-secondary">
        📋 View Sessions
      </button>
      <button @click="goToChat" class="btn-secondary">
        💬 Start Chatting
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToChat() {
      this.$router.push('/chat').catch(err => {
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
    goToConfig() {
      this.$router.push('/phone-config').catch(err => {
        // Ignore navigation duplicated error
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    }
  }
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%);
  color: #2c5f7d;
  padding: 2rem;
  animation: fadeInBg 0.8s ease;
}

@keyframes fadeInBg {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-shadow: 0 2px 20px rgba(255, 255, 255, 0.5);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.8;
  color: rgba(0, 0, 0, 0.7);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin-bottom: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.9);
}

.icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.feature-card:hover .icon {
  animation: none;
  transform: scale(1.2);
  transition: transform 0.3s ease;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2c5f7d;
  font-weight: 700;
}

.feature-card p {
  opacity: 0.8;
  color: rgba(0, 0, 0, 0.7);
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;
}

.btn-primary,
.btn-secondary {
  background: rgba(44, 95, 125, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 25px rgba(44, 95, 125, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #2c5f7d;
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: rgba(44, 95, 125, 1);
  transform: scale(1.08) translateY(-3px);
  box-shadow: 0 12px 40px rgba(44, 95, 125, 0.4);
  border-color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: scale(1.08) translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.btn-primary:active,
.btn-secondary:active {
  transform: scale(1) translateY(0);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
  
  .actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
}
</style>

