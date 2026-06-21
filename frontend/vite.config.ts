import { defineConfig, Plugin } from "vite";
import { resolve } from "path";

/**
 * Inject `<link rel="preload">` hints for the most critical font files.
 *
 * Browsers discover fonts late (after CSS is parsed), so preloading the
 * body-text fonts (Inter 400/500 for Latin + Latin-ext) improves first
 * render metrics and reduces layout shifts.
 */
function fontPreloadPlugin(): Plugin {
  const priorityPatterns = [
    /^inter-latin-400-normal-.+\.woff2$/,
    /^inter-latin-500-normal-.+\.woff2$/,
    /^inter-latin-ext-400-normal-.+\.woff2$/,
    /^inter-latin-ext-500-normal-.+\.woff2$/,
  ];

  return {
    name: "ai-skill:font-preload",
    apply: "build",
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;

      const links: string[] = [];
      for (const fileName of Object.keys(bundle)) {
        const name = fileName.split("/").pop() || "";
        if (priorityPatterns.some((re) => re.test(name))) {
          links.push(
            `<link rel="preload" href="./${fileName}" as="font" type="font/woff2" crossorigin>`
          );
        }
      }

      if (!links.length) return html;
      // Insert early in <head> so browsers discover preloads before the
      // CSS that references the fonts.
      const headOpen = html.indexOf("<head>");
      if (headOpen === -1) return html;
      const insertAt = headOpen + "<head>".length;
      return html.slice(0, insertAt) + "\n" + links.join("\n") + "\n" + html.slice(insertAt);
    },
  };
}

// Optimized Vite config:
//  - emit a flat `dist/` with code splitting for better caching
//  - ship base = "./" so the site works under
//    https://<user>.github.io/AI-SKILL/  AND
//    http://localhost:5173/  with the same index.html
//  - enable CSS code splitting for smaller initial bundles
//  - process BOTH index.html and 404.html through Vite so the
//    hashed JS/CSS asset paths are injected. 404.html is the
//    GH Pages deep-link fallback (see public/404.html's
//    redirect script for the full story).
export default defineConfig({
  plugins: [fontPreloadPlugin()],
  base: "./",
  build: {
    outDir: "dist",
    target: "es2022",
    cssCodeSplit: true, // Enable CSS code splitting for better caching
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        // 404.html is the GH Pages deep-link fallback. We
        // list it as a second entry so Vite resolves its
        // own /src/main.ts + /src/style.css references and
        // rewrites them to the hashed asset URLs.
        fallback: resolve(__dirname, "404.html"),
      },
      output: {
        // Enable automatic code splitting for better caching
        manualChunks: undefined,
        // Optimize chunk file names for better caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    // Enable minification for smaller bundles (Vite 8 uses oxc by default)
    minify: true,
    // Inline assets smaller than 4KB
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
  },
});
