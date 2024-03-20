import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nuxt/nuxt',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		build: 'build',
		beforeTest: 'pnpm playwright-core install',
		test: ['test:fixtures', 'test:fixtures:dev', 'test:types'],
	})
}
