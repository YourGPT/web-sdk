import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/react/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2020',
  outDir: 'react/dist',
  external: ['react', 'react-dom'],
  banner: {
    js: '/* YourGPT SDK - React Package */',
  },
  esbuildOptions: (options) => {
    options.banner = {
      js: '/* YourGPT SDK - React Package - https://yourgpt.ai */',
    };
  },
});