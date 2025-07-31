import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react',
		build: 'build',
	})
}

export const packages = {
	'@vitejs/plugin-react': 'packages/plugin-react',
	'@vitejs/plugin-rsc': 'packages/plugin-rsc',
}
