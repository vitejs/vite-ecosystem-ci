import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'mandarini/nx-labs',
		branch: 'test/ecosystem-tests',
		build: 'ecosystem:build',
		test: 'ecosystem:e2e',
	})
}
