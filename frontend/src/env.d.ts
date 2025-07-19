/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TOKEN: string
  readonly VITE_BOT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __RUNTIME_CONFIG__?: {
    REACT_APP_TOKEN?: string
    REACT_APP_BOT_ID?: string
  }
}