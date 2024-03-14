import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function build(options: RunOptions) {
	if (options.viteMajor < 4) {
		return
	}
	return runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
		overrides: {
			svelte: 'latest',
		},
	})
}

export const packages = {
	'@sveltejs/vite-plugin-svelte': 'packages/vite-plugin-svelte',
	'@sveltejs/vite-plugin-svelte-inspector':
		'packages/vite-plugin-svelte-inspector',
}
