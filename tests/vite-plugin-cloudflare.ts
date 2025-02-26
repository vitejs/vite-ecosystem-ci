import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.js'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'cloudflare/workers-sdk',
		test: 'pnpm test:ci -F @vite-plugin-cloudflare/playground',
	})
}
