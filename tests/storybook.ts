import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/builder-vite',
		branch: 'main',
		build: 'prepublish',
		test: ['build-examples', 'test-ci'],
	})
}
