import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isAdmin = mode === "admin";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    build: {
      // Magkaibang folder para hindi maghalo ang files
      outDir: isAdmin ? "dist-admin" : "dist",
      rollupOptions: {
        input: {
          // Ginagawa nating 'index.html' ang filename kahit admin.html ang source
          index: isAdmin
            ? path.resolve(__dirname, "admin.html")
            : path.resolve(__dirname, "index.html"),
        },
      },
    },
  };
});