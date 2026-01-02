import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default defineConfig({
  input: 'src/index.ts',
  output: [
  // Node.js CommonJS
  {
    file: 'dist/index.cjs',
    format: 'cjs',
    exports: 'named',
    sourcemap: false
  },

  // Node.js ESM
  {
    file: 'dist/index.mjs',
    format: 'es',
    sourcemap: false
  },
  {
    file: 'dist/index.esm.js',
    format: 'es',
    sourcemap: false
  },
  {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'TelegramMd2Html',
    exports: 'named',
    sourcemap: false
  }
],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      exclude: ['**/__tests__/**/*']
    })
  ],
  external: []
});