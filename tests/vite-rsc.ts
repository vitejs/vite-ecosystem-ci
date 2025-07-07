import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'hi-ogawa/vite-plugins',
		branch: 'main',
		build: 'vite-ecosystem-ci:build',
		beforeTest: 'vite-ecosystem-ci:before-test',
		test: 'vite-ecosystem-ci:test',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on vite-rsc / vite-plugin-cloudflare side (https://github.com/cloudflare/workers-sdk/issues/9609)
`
