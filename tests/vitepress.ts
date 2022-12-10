import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	if (options.viteMajor < 4) {
		return // no branch for vite 3
	}
	await runInRepo({
		...options,
		repo: 'vuejs/vitepress',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		branch: 'main',
		build: 'build',
		test: 'test',
	})
}
