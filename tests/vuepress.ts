import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vuepress/core',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		branch: 'main',
		build: 'build',
		beforeTest: 'pnpm --filter e2e exec playwright install chromium',
		test: 'test',
	})
}
