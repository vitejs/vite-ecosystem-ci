import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'windicss/vite-plugin-windicss',
		build: 'build',
		test: 'test',
	})
}
