import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'dai-shi/waku',
		branch: 'main',
		build: 'compile',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test-vite-ecosystem-ci',
		overrides: {
			// It uses Vitest 3.2+ so we don't need to inject the overrides.
			// If we inject overrides, the following error happens due to how waku sets overrides for the test.
			//
			// npm error code EINVALIDTAGNAME
			// npm error Invalid tag name "<3.2.0>vite" of package "vitest@<3.2.0>vite": Tags may not have any characters that encodeURIComponent encodes.
			vitest: false,
		},
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on waku side
`
