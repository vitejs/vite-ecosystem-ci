import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/language-tools',
		branch: 'master',
		beforeBuild: 'bootstrap',
		build: ['build', 'pnpm --dir packages/svelte-check build'],
	})
}

export const packages = {
	'svelte-check': 'packages/svelte-check',
}
