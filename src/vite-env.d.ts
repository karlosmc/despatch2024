/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_LOGO?: string;
  /** "true" muestra la Guía rápida (empresas que usan SCOP). */
  readonly VITE_GUIA_RAPIDA?: string;
}
