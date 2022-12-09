import { RunOptions } from '../types'
import { runInRepo } from '../utils'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'fwouts/previewjs',
		branch: 'main',
		overrides: {
			'@vitejs/plugin-react': true,
		},
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'vite-ecosystem-ci:before-test',
		test: ['vite-ecosystem-ci:test'],
	})
}
