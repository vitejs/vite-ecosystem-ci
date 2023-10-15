import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'tajo/ladle',
		branch: 'main',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
	})
}
