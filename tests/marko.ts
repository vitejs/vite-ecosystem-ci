import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'marko-js/vite',
		dir: 'marko', // default is last segment of repo, which would be vite and confusing
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
		overrides: {
			esbuild: true,
		},
	})
}
