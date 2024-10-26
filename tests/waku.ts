import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'dai-shi/waku',
		branch: 'dev',
		build: 'build',
		beforeTest: 'pnpm playwright-core install',
		test: 'e2e',
	})
}
