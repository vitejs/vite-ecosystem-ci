import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: ['test', 'typecheck'],
		overrides: {
			'@vitejs/plugin-react-oxc>vite': 'catalog:rolldown-vite',
		},
	})
}
