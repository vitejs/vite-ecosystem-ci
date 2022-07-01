import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'laravel/vite-plugin',
		build: 'build',
		test: 'test'
	})
}
