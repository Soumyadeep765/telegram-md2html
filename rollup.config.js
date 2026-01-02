// rollup.config.js - Simplified version
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'es'
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
]);