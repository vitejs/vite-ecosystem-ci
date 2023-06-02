import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'pngwn/MDsveX',
		branch: 'master',
		build: 'pnpm -r build',
		test: 'pnpm test',
	})
}
