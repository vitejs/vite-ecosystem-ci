import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vuejs/vitepress',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		branch: options.viteMajor === 4 ? 'vite-4' : 'main',
		build: 'build',
		test: 'test',
	})
}
