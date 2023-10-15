import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'histoire-dev/histoire',
		branch: 'main',
		build: 'build',
		test: ['test', 'test:examples'],
	})
}
