import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vite-pwa/vite-plugin-pwa',
		branch: 'main',
		beforeTest: 'pnpm playwright install chromium',
		build: 'build',
		test: 'test:vite-ecosystem-ci',
	})
}
