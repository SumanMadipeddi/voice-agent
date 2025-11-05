# LiveKit Agent Starter - React Application

## 🎯 Overview

This application serves as a frontend client for LiveKit Agents, enabling users to interact with AI agents through voice, video, and text. It's built with React 19 and Vite for optimal performance and developer experience.

## ✨ Features

- **Real-time Voice Interaction**: Connect and communicate with LiveKit Agents via voice
- **Video Support**: Camera video streaming capabilities
- **Screen Sharing**: Share your screen during sessions
- **Transcriptions**: Real-time text transcriptions of conversations
- **Chat Input**: Text-based messaging support
- **Virtual Avatars**: Integration with virtual avatar systems
- **Theme Support**: Light/dark theme with system preference detection
- **Customizable UI**: Branding, colors, and UI text customization
- **Responsive Design**: Modern, responsive user interface

## 🚀 Installation

1. Clone or download this repository

2. Navigate to the project Frontend directory:
   ```bash
   cd agent-react
   npm intall
   ```

3. Navigate to the project backend directory:
   ```bash
   cd backend 
   uv sync
   ```

## 🔧 Environment Setup

1. Create a `.env` file in the root directory and follow .env.example:
   ```bash
   touch .env
   ```

2. Get your LiveKit Cloud credentials:
   - Go to [LiveKit Cloud Dashboard](https://cloud.livekit.io)
   - Select your project (or create a new one)
   - Navigate to **Settings** → **Keys**
   - Copy your credentials

3. Add the following variables to your `.env` file:
   ```env
   # Required: LiveKit Cloud Connection
   VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
   VITE_LIVEKIT_API_KEY=your-api-key-here
   VITE_LIVEKIT_API_SECRET=your-api-secret-here
   ```

## 🏃 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   uv run agent.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. You'll need a LiveKit Agent to interact with. You can:
   - Use the [LiveKit Cloud Sandbox](https://cloud.livekit.io/projects/p_/sandbox/templates/agent-starter-react)
   - Deploy a [Python agent](https://github.com/livekit-examples/agent-starter-python)
   - [Create your own agent](https://docs.livekit.io/agents/start/voice-ai/)

## 📁 Project Structure

```
agent-starter-react/
├── src/
│   ├── app-config.ts          # Application configuration
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # Application entry point
│   ├── components/
│   │   ├── app/               # Main application components
│   │   │   ├── app.tsx
│   │   │   ├── session-view.tsx
│   │   │   ├── welcome-view.tsx
│   │   │   ├── view-controller.tsx
│   │   │   └── ...
│   │   ├── livekit/           # LiveKit-specific components
│   │   │   ├── agent-control-bar/
│   │   │   ├── button.tsx
│   │   │   ├── chat-entry.tsx
│   │   │   └── ...
│   │   └── Header.tsx         # Application header
│   ├── hooks/                 # Custom React hooks
│   │   ├── useChatMessages.ts
│   │   ├── useRoom.ts
│   │   └── ...
│   ├── lib/                   # Utility functions
│   │   ├── api.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css        # Global styles
├── public/                    # Static assets
├── fonts/                     # Custom fonts
├── .env                       # Environment variables (create this)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production

## 📚 Additional Resources

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit Agents Guide](https://docs.livekit.io/agents)
- [LiveKit JavaScript SDK](https://github.com/livekit/client-sdk-js)
- [LiveKit Cloud](https://cloud.livekit.io)
---