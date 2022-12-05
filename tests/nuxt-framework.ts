import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nuxt/framework',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		branch: options.viteMajor === 4 ? 'feat/vite-4' : 'main',
		build: 'build',
		test: ['test:fixtures', 'test:types'],
	})
}
