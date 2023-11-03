import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-vue',
		build: 'build',
	})
}

export const packages = {
	'@vitejs/plugin-vue': 'packages/plugin-vue',
	'@vitejs/plugin-vue-jsx': 'packages/plugin-vue-jsx',
}
