import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		overrides: {
			'svelte-check': false,
			'@sveltejs/vite-plugin-svelte': false,
			'@sveltejs/kit': false,
		},
	})
}

export const packages = {
	'@sveltejs/vite-plugin-svelte': 'packages/vite-plugin-svelte',
}
