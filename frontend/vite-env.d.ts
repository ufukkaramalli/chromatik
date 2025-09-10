/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPLICATION_NAME: string
  readonly VITE_API_URL: string
  // burada ihtiyacın olan diğer env değişkenlerini ekleyebilirsin
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}