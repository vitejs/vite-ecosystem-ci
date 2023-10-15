import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nuxt/nuxt',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		build: 'build',
		beforeTest: 'pnpm playwright-core install',
		test: ['test:fixtures', 'test:types'],
	})
}
