import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	if (options.viteMajor < 4) {
		return // no branch for vite 3
	}
	await runInRepo({
		...options,
		repo: 'nuxt/nuxt',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		build: 'build',
		beforeTest: 'pnpm playwright install',
		test: ['test:fixtures', 'test:types'],
	})
}
