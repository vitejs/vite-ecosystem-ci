import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: 'main',
		overrides: {
			'@sveltejs/vite-plugin-svelte': true,
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
