import { runInRepo, $ } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'ElMassimo/iles',
		beforeInstall: async () => $`git lfs install && git lfs pull`,
		build: 'build:all',
		test: 'test'
	})
}
