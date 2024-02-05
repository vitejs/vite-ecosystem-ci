import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/rollup-plugin-svelte',
		branch: 'master',
	})
}

export const packages = {
	'rollup-plugin-svelte': '.',
}
