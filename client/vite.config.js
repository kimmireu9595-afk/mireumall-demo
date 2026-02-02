import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.iamport.kr https://code.jquery.com; script-src-elem 'self' 'unsafe-inline' https://cdn.iamport.kr https://code.jquery.com; connect-src 'self' http://localhost:5005 https://api.iamport.kr https://service.iamport.kr; frame-src 'self' https://service.iamport.kr https://kapi.kakao.com https://www.myspay.com; img-src 'self' data: *; style-src 'self' 'unsafe-inline';",
    },
  },
});
