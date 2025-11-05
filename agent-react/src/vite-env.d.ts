/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_CONFIG_ENDPOINT?: string;
  readonly VITE_SANDBOX_ID?: string;
  readonly VITE_CONN_DETAILS_ENDPOINT?: string;
  readonly VITE_LIVEKIT_API_KEY?: string;
  readonly VITE_LIVEKIT_API_SECRET?: string;
  readonly VITE_LIVEKIT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

