import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://movieposters.blob.core.windows.net; frame-ancestors 'none'; font-src 'self' data:; connect-src 'self' https://intexrahhh-backend-fzfrcxdnc2b5g9f7.eastus-01.azurewebsites.net; object-src 'none'; base-uri 'self'; form-action 'self';",
    },
  },
});
