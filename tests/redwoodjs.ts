import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'redwoodjs/redwood',
		build: { script: 'build', args: ['--skip-nx-cache'] },
		test: { script: 'test-ci', args: ['--skip-nx-cache'] },
	})
}
