import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/svelte-eslint-parser',
		branch: 'main',
		build: 'build',
		test: 'test',
	})
}
