import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	// Enable terminal colors for snapshot testing.
	// https://nodejs.org/api/cli.html#environment-variables
	const initialValue = process.env.FORCE_COLOR
	process.env.FORCE_COLOR = 'true'

	try {
		await runInRepo({
			...options,
			repo: 'Shopify/hydrogen',
			build: 'build',
			test: 'test:vite-ci'
		})
	} finally {
		process.env.FORCE_COLOR = initialValue
	}
}
