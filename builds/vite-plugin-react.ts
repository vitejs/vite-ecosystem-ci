import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: process.env.VITE_PLUGIN_REACT_REPO || 'vitejs/vite-plugin-react',
		branch: process.env.VITE_PLUGIN_REACT_REF || 'main',
		build: 'build',
	})
}

export const packages = {
	'@vitejs/plugin-react': 'packages/plugin-react',
	'@vitejs/plugin-rsc': 'packages/plugin-rsc',
}
