import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function build(options: RunOptions) {
	return runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react',
		build: 'build'
	})
}

export const packages = {
	'@vitejs/plugin-react':'packages/plugin-react'
}
