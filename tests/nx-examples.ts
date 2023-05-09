import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'mandarini/nx-examples',
		branch: 'test/katerina',
		build: 'vite:build',
		test: 'vite:test',
	})
}
