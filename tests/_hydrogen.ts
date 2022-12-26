import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'Shopify/hydrogen',
		build: 'build',
		test: 'test:vite-ci',
	})
}
