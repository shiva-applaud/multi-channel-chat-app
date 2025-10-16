# Multi-Channel Chat Client

Vue 2 frontend for the multi-channel chat application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run serve
```

The app will be available at http://localhost:8080

## Build for Production

```bash
npm run build
```

This will create a `dist` folder with optimized production files.

## Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable Vue components
│   ├── router/      # Vue Router configuration
│   ├── services/    # API services
│   ├── store/       # Vuex state management
│   ├── views/       # Page components
│   ├── App.vue      # Root component
│   └── main.js      # Application entry point
├── babel.config.js  # Babel configuration
├── package.json     # Dependencies
└── vue.config.js    # Vue CLI configuration
```

## Features

- **Home Page**: Landing page with feature overview
- **Chat Interface**: Real-time messaging with channels
- **Channel Management**: Create and manage WhatsApp, SMS, and Voice channels
- **Real-time Updates**: Socket.IO integration for live messages
- **Responsive Design**: Works on desktop and mobile

## Development

The client uses:
- Vue 2 for the UI framework
- Vuex for state management
- Vue Router for navigation
- Socket.IO for real-time communication
- Axios for HTTP requests

## API Integration

The client connects to the backend server at `http://localhost:3000` by default. This can be configured in `vue.config.js`.

