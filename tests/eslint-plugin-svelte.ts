import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/eslint-plugin-svelte',
		branch: 'main',
		build: 'pnpm --dir packages/eslint-plugin-svelte build',
		test: 'pnpm --dir packages/eslint-plugin-svelte test',
	})
}
