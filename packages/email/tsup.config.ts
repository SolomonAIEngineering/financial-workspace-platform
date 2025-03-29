import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    sourcemap: true,
    clean: true,
    external: [
        'react',
        'react-dom',
        '@solomonai/platform-config',
        '@solomonai/env',
        '@react-email/components',
        '@react-email/tailwind',
        'resend',
    ],
    esbuildOptions(options) {
        // Needed for JSX and TypeScript React support
        options.jsx = 'automatic'
    },
}) 