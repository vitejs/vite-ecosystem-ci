import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react-swc',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: ['test', 'tsc'],
	})
}
