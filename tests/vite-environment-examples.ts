import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	if (options.viteMajor < 6) {
		return
	}
	await runInRepo({
		...options,
		repo: 'hi-ogawa/vite-environment-examples',
		branch: 'main',
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'vite-ecosystem-ci:before-test',
		test: 'vite-ecosystem-ci:test',
	})
}
