import { defineConfig, loadEnv, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  /**
   * Proxy del SCOP para desarrollo (`npm run dev` / `npm run host`).
   * El navegador no puede llamar al servicio directo: no responde CORS y exige
   * la clave también en la verificación previa (OPTIONS). El servidor de Vite
   * reenvía la consulta y agrega la clave, que así nunca llega al navegador.
   * En producción esto lo debe hacer el backend (POST /api/scop/consulta).
   */
  const proxy: Record<string, ProxyOptions> = {}
  if (env.VITE_API_SCOP) {
    const destino = new URL(env.VITE_API_SCOP.trim())
    proxy['/scop-api'] = {
      target: destino.origin,
      changeOrigin: true,
      rewrite: (ruta) => ruta.replace(/^\/scop-api/, destino.pathname),
      headers: { 'x-api-key': (env.VITE_API_SCOP_KEY || '').trim() },
    }
  }

  return {
    plugins: [react()],
    server: { proxy },
  }
})
