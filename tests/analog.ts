import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'analogjs/analog',
		branch: 'main',
		build: 'build:vite-ci',
		test: 'test:vite-ci',
	})
}
