import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	if (options.viteMajor < 4) {
		// only latest version
		return
	}

	await runInRepo({
		...options,
		repo: 'vite-pwa/vite-plugin-pwa',
		branch: 'main',
		beforeTest: 'pnpm playwright install chromium',
		build: 'build',
		test: 'test:vite-ecosystem-ci',
	})
}
