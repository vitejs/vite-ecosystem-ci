import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-labs',
		branch: 'main',
		build: ['build deno'],
		test: ['test deno'],
		e2e: ['e2e deno-e2e'],
	})
}
