import { runInRepo, $ } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

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
