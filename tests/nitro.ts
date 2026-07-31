import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nitrojs/nitro',
		branch: 'main',
		build: 'build',
		test: 'pnpm vitest run test/vite',
	})
}
