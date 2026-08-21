import { runInRepo, $ } from '../utils.ts'
import type { DisableWorkflow, RunOptions } from '../types.d.ts'

export const disableWorkflow: DisableWorkflow = {
	scheduled: 'disabled until its CI is fixed',
}

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'ElMassimo/iles',
		overrides: {
			'@vitejs/plugin-vue': true,
		},
		beforeInstall: async () => $`git lfs install && git lfs pull`,
		build: 'build:all',
		test: 'test',
	})
}
