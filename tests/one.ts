import type { DisableWorkflow, RunOptions } from '../types.d.ts'
import { runInRepo } from '../utils.ts'

export const disableWorkflow: DisableWorkflow = {
	scheduled: 'disabled until we figured out how to support bun',
	selected: 'disabled until we figured out how to support bun',
}

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'onejs/one',
		branch: 'main',
		build: ['clean:build', 'build'],
		beforeTest: 'yarn playwright install chromium',
		test: 'test:vite-ecosystem-ci',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on one side (type incompatibility)
`
