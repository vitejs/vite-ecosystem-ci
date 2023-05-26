import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-labs',
		branch: 'main',
		build: ['build rspack'],
		test: ['test rspack'],
		e2e: ['e2e rspack-e2e'],
	})
}
