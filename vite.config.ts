import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' is required for GitHub Pages repo-name subpaths
// (the app is served from https://<user>.github.io/math-worksheet-generator/)
export default defineConfig({
  base: './',
  plugins: [svelte()],
});
