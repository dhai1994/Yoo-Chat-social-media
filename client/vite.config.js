import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default ({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return defineConfig({
    plugins: [
      react(), 
    ],

    server: {
      host: true,
      proxy: {
        "/api": {
          target: `${env.BACK_END}/api`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },

        "/files": {
          target: `${env.BACK_END}/files`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/files/, ""),
        },

        "/socket.io": {
          target: `ws://${env.BACK_END.replace(/^https?:\/\//, "")}`,
          ws: true,
        },
      },
    },
  });
};
