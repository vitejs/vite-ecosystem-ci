import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vuejs/vitepress',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		branch: 'main',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
	})
}
