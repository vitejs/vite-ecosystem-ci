import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

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
