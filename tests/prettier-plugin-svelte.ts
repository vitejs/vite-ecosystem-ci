import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/prettier-plugin-svelte',
		branch: 'master',
		build: 'build',
		test: 'test',
	})
}
