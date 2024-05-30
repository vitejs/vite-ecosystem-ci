import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'Shopify/hydrogen',
		build: 'build',
		test: 'test:vite-ci',
	})
}
