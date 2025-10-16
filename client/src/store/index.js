import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    channels: [],
    currentChannel: null,
    messages: [],
    contacts: [],
    socket: null,
    connected: false
  },
  mutations: {
    SET_CHANNELS(state, channels) {
      state.channels = channels;
    },
    ADD_CHANNEL(state, channel) {
      state.channels.push(channel);
    },
    SET_CURRENT_CHANNEL(state, channel) {
      state.currentChannel = channel;
    },
    SET_MESSAGES(state, messages) {
      state.messages = messages;
    },
    ADD_MESSAGE(state, message) {
      state.messages.push(message);
    },
    SET_CONTACTS(state, contacts) {
      state.contacts = contacts;
    },
    ADD_CONTACT(state, contact) {
      state.contacts.push(contact);
    },
    SET_SOCKET(state, socket) {
      state.socket = socket;
    },
    SET_CONNECTED(state, connected) {
      state.connected = connected;
    }
  },
  actions: {
    async fetchChannels({ commit }) {
      try {
        const response = await fetch('http://localhost:3000/api/channels');
        const channels = await response.json();
        commit('SET_CHANNELS', channels);
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    },
    async fetchMessages({ commit }, channelId) {
      try {
        const response = await fetch(`http://localhost:3000/api/messages/channel/${channelId}`);
        const messages = await response.json();
        commit('SET_MESSAGES', messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    },
    async fetchContacts({ commit }) {
      try {
        const response = await fetch('http://localhost:3000/api/contacts');
        const contacts = await response.json();
        commit('SET_CONTACTS', contacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    }
  },
  getters: {
    getChannelById: (state) => (id) => {
      return state.channels.find(channel => channel.id === id);
    }
  }
});

