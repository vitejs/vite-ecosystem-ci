import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'rakkasjs/rakkasjs',
		branch: 'next',
		build: 'build',
		test: 'vite-ecosystem-ci'
	})
}
