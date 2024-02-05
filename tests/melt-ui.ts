import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'melt-ui/melt-ui',
		branch: 'develop',
		test: 'pnpm test',
	})
}
