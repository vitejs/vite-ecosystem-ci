import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'dai-shi/waku',
		branch: 'main',
		build: 'compile',
		beforeTest: 'pnpm playwright install',
		test: ['pnpm run --filter waku test', 'e2e'],
	})
}
