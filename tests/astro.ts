import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'withastro/astro',
		branch: 'main',
		build: 'build:ci',
		test: 'test:vite-ci'
	})
}
