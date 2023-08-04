import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'mandarini/nx',
		branch: 'test/try-catch-pm',
		build: { script: 'build-project', args: ['vite', '--skip-nx-cache'] },
		test: [
			{ script: 'test', args: ['vite', '--skip-nx-cache'] },
			{ script: 'e2e', args: ['e2e-vite', '--skip-nx-cache'] },
		],
	})
}
