import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/language-tools',
		branch: 'master',
		beforeBuild: 'bootstrap',
		build: 'build',
	})
}

export const packages = {
	'svelte-check': 'packages/svelte-check',
}
