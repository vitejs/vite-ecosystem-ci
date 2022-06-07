import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/builder-vite',
		branch: 'vite-3',
		build: 'prepublish',
		test: ['build-examples', 'test-ci']
	})
}
