import { runInRepo } from '../utils.ts'
import type { DisableWorkflow, RunOptions } from '../types.d.ts'

export const disableWorkflow: DisableWorkflow = {
	scheduled: 'disabled until they complete they migration back to Vite',
	selected: 'disabled until they complete they migration back to Vite',
}

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'Shopify/hydrogen',
		build: 'build',
		test: 'test:vite-ci',
	})
}
