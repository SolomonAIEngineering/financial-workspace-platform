import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['cjs', 'esm'],
    dts: false,
    sourcemap: true,
    clean: true,
    external: [
        'react',
        'react-dom',
        '@solomonai/location',
        '@solomonai/ui-design-system',
        '@solomonai/utils',
    ],
    esbuildOptions(options) {
        // Needed for JSX and TypeScript React support
        options.jsx = 'automatic'
    },
}) 