import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vikejs/vike',
		branch: 'main',
		overrides: {
			'@vitejs/plugin-react': true,
			'@vitejs/plugin-vue': true,
		},
		build: 'build',
		test: 'test',
	})
}
