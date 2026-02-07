# Voice Agent

Real-time voice agent application with React frontend and Python backend, built on LiveKit with RAG capabilities.

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager
- LiveKit CLI: `winget install LiveKit.LiveKitCLI`
- LiveKit Cloud, Pinecone, and Azure OpenAI accounts

## Installation

### Frontend

```bash
cd agent-react
npm install
```

### Backend

```bash
cd backend
uv sync
```

## Configuration

Create a `.env` file in the project root:

```env
VITE_LIVEKIT_URL=wss://your-project.livekit.cloud
VITE_LIVEKIT_API_KEY=your-api-key
VITE_LIVEKIT_API_SECRET=your-api-secret
PINECONE_API_KEY=your-pinecone-api-key
AZURE_OPENAI_API_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

Get LiveKit credentials from [LiveKit Cloud Dashboard](https://cloud.livekit.io) → Project Settings → Keys.

## Running

### Frontend

```bash
cd agent-react
npm run dev
```

Access at `http://localhost:3000`

### Backend

```bash
cd backend
uv run agent.py
```

## Project Structure

```
voice-agent/
├── agent-react/          # React frontend
├── backend/              # Python agent
│   ├── agent.py         # Agent entrypoint
│   └── rag/             # RAG implementation
└── README.md
```

## Documentation

- [LiveKit Documentation](https://docs.livekit.io)
- [LiveKit Agents](https://docs.livekit.io/agents)
