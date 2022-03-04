import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	// Enable terminal colors for snapshot testing.
	// https://nodejs.org/api/cli.html#environment-variables
	process.env.FORCE_COLOR = 'true'

	await runInRepo({
		...options,
		repo: 'Shopify/hydrogen',
		build: 'build',
		test: 'test:vite-ci'
	})
}
