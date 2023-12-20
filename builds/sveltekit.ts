import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'main',
		overrides: {
			'@sveltejs/vite-plugin-svelte': true,
			'@sveltejs/vite-plugin-svelte-inspector': true,
			'svelte-check': true,
		},
	})
}

export const packages = {
	'@sveltejs/kit': 'packages/kit',
	'@sveltejs/adapter-auto': 'packages/adapter-auto',
	'@sveltejs/adapter-node': 'packages/adapter-node',
	'@sveltejs/adapter-static': 'packages/adapter-static',
	'create-svelte': 'packages/create-svelte',
}
