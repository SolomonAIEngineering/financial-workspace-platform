import { Options, defineConfig } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/**/*.ts'],
  format: ['esm'],
  dts: true,
  minify: true,
  external: ['react', 'crypto'],
  noExternal: ['jose'],
  ...options,
}))
