import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/svelte-eslint-parser',
		branch: 'main',
		build: 'build',
		test: 'test',
	})
}
