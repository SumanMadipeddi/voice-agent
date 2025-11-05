import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, TokenSource } from 'livekit-client';
import { AppConfig } from '@/app-config';
import { toastAlert } from '@/components/livekit/alert-toast';
import { getConnectionDetails } from '@/lib/api';

export function useRoom(appConfig: AppConfig) {
  const aborted = useRef(false);
  const room = useMemo(() => new Room(), []);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    function onDisconnected() {
      setIsSessionActive(false);
    }

    function onMediaDevicesError(error: Error) {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    }

    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room]);

  useEffect(() => {
    return () => {
      aborted.current = true;
      room.disconnect();
    };
  }, [room]);

  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        // First try to use a backend endpoint if configured
        const endpoint = import.meta.env.VITE_CONN_DETAILS_ENDPOINT;
        
        if (endpoint) {
          try {
            const url = new URL(endpoint, window.location.origin);
            const res = await fetch(url.toString(), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Sandbox-Id': appConfig.sandboxId ?? '',
              },
              body: JSON.stringify({
                room_config: appConfig.agentName
                  ? {
                      agents: [{ agent_name: appConfig.agentName }],
                    }
                  : undefined,
              }),
            });
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return await res.json();
          } catch (error) {
            console.error('Error fetching connection details from endpoint:', error);
            throw new Error('Error fetching connection details!');
          }
        }
        
        // Fallback to direct function call (requires API keys to be exposed client-side)
        // WARNING: This exposes your LiveKit API keys in the client bundle.
        // For production, use VITE_CONN_DETAILS_ENDPOINT pointing to a backend service.
        try {
          return await getConnectionDetails(appConfig.agentName);
        } catch (error) {
          console.error('Error getting connection details:', error);
          throw new Error('Error getting connection details!');
        }
      }),
    [appConfig]
  );

  const startSession = useCallback(() => {
    setIsSessionActive(true);

    if (room.state === 'disconnected') {
      const { isPreConnectBufferEnabled } = appConfig;
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: isPreConnectBufferEnabled,
        }),
        tokenSource
          .fetch({ agentName: appConfig.agentName })
          .then((connectionDetails) =>
            room.connect(connectionDetails.serverUrl, connectionDetails.participantToken)
          ),
      ]).catch((error) => {
        if (aborted.current) {
          // Once the effect has cleaned up after itself, drop any errors
          //
          // These errors are likely caused by this effect rerunning rapidly,
          // resulting in a previous run `disconnect` running in parallel with
          // a current run `connect`
          return;
        }

        toastAlert({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      });
    }
  }, [room, appConfig, tokenSource]);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
  }, []);

  return { room, isSessionActive, startSession, endSession };
}
