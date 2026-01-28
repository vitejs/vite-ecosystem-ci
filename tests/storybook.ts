import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/storybook',
		branch: 'next',
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'vite-ecosystem-ci:before-test',
		test: 'vite-ecosystem-ci:test',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on storybook side ("yarn install" errors with peer dep errors)
`
