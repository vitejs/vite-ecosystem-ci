import { RunOptions } from '../types'
import { runInRepo } from '../utils'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'fwouts/previewjs',
		branch: 'main',
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'pnpm vite-ecosystem-ci:before-test',
		test: ['vite-ecosystem-ci:test']
	})
}
