import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    root: 'src',
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'jsdom',
        coverage: {
            exclude: ['index.ts', '**/*.stories.ts']
        }
    }
})
