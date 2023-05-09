import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'unocss/unocss',
		build: 'build',
		test: 'test',
	})
}
