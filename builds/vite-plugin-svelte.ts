import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/vite-plugin-svelte',
		branch: options.viteMajor === 4 ? 'main' : 'v1',
		overrides: {
			svelte: 'latest',
		},
		build: 'build',
	})
}

export const packages = {
	'@sveltejs/vite-plugin-svelte': 'packages/vite-plugin-svelte',
	'@sveltejs/vite-plugin-svelte-inspector': 'packages/vite-plugin-svelte-inspector',
}
