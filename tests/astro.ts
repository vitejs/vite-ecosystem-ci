import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'withastro/astro',
		branch: 'vite-3',
		build: 'build:ci',
		test: 'test:vite-ci'
	})
}
