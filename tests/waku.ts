import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'dai-shi/waku',
		branch: 'main',
		build: 'compile',
		beforeTest: [
			'pnpm playwright install chromium',
			'pnpm --filter ./packages/waku add -P rollup',
		],
		test: 'test-vite-ecosystem-ci',
	})
}
