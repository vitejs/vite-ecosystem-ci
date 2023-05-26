import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx-labs',
		branch: 'main',
		build: ['build nx-ignore'],
		test: ['test nx-ignore'],
		e2e: ['e2e nx-ignore-e2e'],
	})
}
