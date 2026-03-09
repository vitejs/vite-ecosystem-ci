import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/storybook',
		branch: options.viteMajor < 8 ? 'next' : 'valentin/support-vite-8',
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'vite-ecosystem-ci:before-test',
		test: 'vite-ecosystem-ci:test',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on storybook side ("yarn install" errors with peer dep errors)
`
