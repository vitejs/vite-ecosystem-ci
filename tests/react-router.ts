import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'remix-run/react-router',
		branch: 'dev',
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'vite-ecosystem-ci:before-test',
		test: 'vite-ecosystem-ci:test',
		overrides: {
			// For Vite 7 support
			'vite-node': '^3.2.2',
		},
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on rolldown side (will be solved by https://github.com/rolldown/rolldown/issues/3500)
`
