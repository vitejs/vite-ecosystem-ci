import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react-pages',
		overrides: {
			'@vitejs/plugin-react': true,
		},
		branch: 'main',
		build: 'pnpm --filter vite-plugin-react-pages run build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
	})
}
