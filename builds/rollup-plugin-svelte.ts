import { runInRepo } from '../utils'
import { RunOptions } from '../types'

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
