import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'pngwn/MDsveX',
		branch: 'master',
		build: 'pnpm -r build',
		test: 'pnpm test',
	})
}
