import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'melt-ui/preprocessor',
		branch: 'main',
		test: 'pnpm test',
	})
}
