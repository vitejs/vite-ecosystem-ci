import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx',
		branch: 'master',
		build: [['build-project', 'vite', '--skip-nx-cache']],
		test: [
			['test', 'vite', '--skip-nx-cache'],
			['e2e', 'e2e-vite', '--skip-nx-cache'],
		],
	})
}
