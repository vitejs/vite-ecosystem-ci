import { runInRepo } from '../utils.ts'
import type { DisableWorkflow, RunOptions } from '../types.d.ts'

export const disableWorkflow: DisableWorkflow = {
	scheduled: 'disabled temporarily',
	selected: 'disabled temporarily',
}

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'redwoodjs/redwood',
		build: { script: 'build', args: ['--skip-nx-cache'] },
		test: { script: 'test-ci', args: ['--skip-nx-cache'] },
	})
}
