import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'melt-ui/preprocessor',
		branch: 'main',
		test: 'pnpm test',
	})
}
