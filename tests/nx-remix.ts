import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-labs',
		branch: 'main',
		build: ['build remix'],
		test: ['test remix'],
		e2e: ['e2e remix-e2e'],
	})
}
