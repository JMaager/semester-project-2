import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
        login: "./src/pages/login.html",
        register: "./src/pages/register.html",
        createListing: "./src/pages/create-listing.html",
        editListing: "./src/pages/edit-listing.html",
        listings: "./src/pages/listings.html",
        listing: "./src/pages/listing.html",
        profile: "./src/pages/profile.html",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
  },
});
