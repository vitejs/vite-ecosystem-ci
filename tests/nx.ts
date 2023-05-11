import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx',
		branch: 'master',
		build: 'build-project vite',
		test: ['test vite', 'e2e e2e-vite'],
	})
}
