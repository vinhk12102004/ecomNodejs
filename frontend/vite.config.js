import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env vars from process.env and .env files
  // Vite automatically loads .env files, but we need to ensure process.env is checked too
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get env vars, prioritizing process.env (from Docker command line)
  const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || '';
  const apiBaseUrl = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:4000';
  
  console.log('[Vite Config] VITE_GOOGLE_CLIENT_ID:', googleClientId ? googleClientId.substring(0, 20) + '...' : 'NOT SET');
  console.log('[Vite Config] VITE_API_BASE_URL:', apiBaseUrl);
  
  return {
    plugins: [react()],
    server: { 
      host: true, 
      port: 5173, 
      strictPort: true,
      // Ensure env vars are available
      envPrefix: 'VITE_'
    },
    // Expose env vars to client code at build time
    // This replaces import.meta.env.VITE_* in the code
    define: {
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
    }
  };
});
