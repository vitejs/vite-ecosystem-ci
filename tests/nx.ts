import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nrwl/nx',
		branch: 'master',
		build: { script: 'build-project', args: ['vite', '--skip-nx-cache'] },
		test: [
			{ script: 'test', args: ['vite', '--skip-nx-cache'] },
			{ script: 'e2e', args: ['e2e-vite', '--skip-nx-cache'] },
		],
		overrides: {
			rollup: false,
		},
	})
}
