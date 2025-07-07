import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.js'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: [
			'pnpm -C packages/plugin-rsc test-e2e',
			'pnpm -C packages/plugin-rsc tsc',
		],
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on plugin-rsc / vite-plugin-cloudflare side (https://github.com/cloudflare/workers-sdk/issues/9609)
`
