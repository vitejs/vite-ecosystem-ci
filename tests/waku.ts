import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'Aslemammad/waku',
		branch: 'chore/HMRBroadcaster-type',
		build: 'compile',
		beforeTest: 'pnpm playwright install',
		test: ['pnpm run --filter waku test', 'e2e'],
	})
}
