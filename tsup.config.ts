import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
  external: ['react', 'react-dom'],
  banner: {
    js: '/* YourGPT SDK */',
  },
  esbuildOptions: (options) => {
    options.banner = {
      js: '/* YourGPT SDK - https://yourgpt.ai */',
    };
  },
});