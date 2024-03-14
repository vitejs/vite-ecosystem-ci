import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

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
		test: 'test:vite-ecosystem-ci',
	})
}
