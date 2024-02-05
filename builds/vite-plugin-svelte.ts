import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: 'main',
	})
}

export const packages = {
	'@sveltejs/vite-plugin-svelte': 'packages/vite-plugin-svelte',
	'@sveltejs/vite-plugin-svelte-inspector':
		'packages/vite-plugin-svelte-inspector',
}
