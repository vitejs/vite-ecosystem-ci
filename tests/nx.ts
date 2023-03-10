import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx',
		branch: 'master',
		build: 'build',
		test: ['npx nx test vite', 'npx nx e2e e2e-vite'],
	})
}
