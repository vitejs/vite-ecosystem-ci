import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react-swc',
		beforeBuild: 'tsc',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
	})
}
