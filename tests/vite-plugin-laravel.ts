import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'innocenzi/laravel-vite',
		build: 'build',
		test: 'test:vite',
	})
}
