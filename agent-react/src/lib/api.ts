import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

// NOTE: you are expected to define the following environment variables in `.env`:
// WARNING: Using these environment variables exposes your LiveKit API keys in the client bundle.
// For production use, set up a backend API endpoint and use VITE_CONN_DETAILS_ENDPOINT instead.
const API_KEY = import.meta.env.VITE_LIVEKIT_API_KEY;
const API_SECRET = import.meta.env.VITE_LIVEKIT_API_SECRET;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export async function getConnectionDetails(agentName?: string): Promise<ConnectionDetails> {
  if (LIVEKIT_URL === undefined) {
    throw new Error('VITE_LIVEKIT_URL is not defined');
  }
  if (API_KEY === undefined) {
    throw new Error('VITE_LIVEKIT_API_KEY is not defined');
  }
  if (API_SECRET === undefined) {
    throw new Error('VITE_LIVEKIT_API_SECRET is not defined');
  }

  // Generate participant token
  const participantName = 'user';
  const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
  const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

  const participantToken = await createParticipantToken(
    { identity: participantIdentity, name: participantName },
    roomName,
    agentName
  );

  // Return connection details
  return {
    serverUrl: LIVEKIT_URL,
    roomName,
    participantToken: participantToken,
    participantName,
  };
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [{ agentName }],
    });
  }

  return at.toJwt();
}

