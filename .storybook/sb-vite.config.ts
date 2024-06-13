import { defineConfig, loadEnv } from 'vite';
import { netlifyPlugin } from '@netlify/remix-adapter/plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    // no Remix Vite plugin here
    plugins: [netlifyPlugin(), tsconfigPaths()],
  };
});
