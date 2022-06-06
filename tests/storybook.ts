import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/builder-vite',
		build: 'prepublish',
		test: ['build-examples', 'test-ci']
	})
}
