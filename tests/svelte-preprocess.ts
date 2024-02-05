import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/svelte-preprocess',
		branch: 'main',
		build: 'build',
		test: 'test',
	})
}
