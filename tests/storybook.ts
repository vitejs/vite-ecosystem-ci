import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/builder-vite',
		branch: 'main',
		build: 'prepublish',
		test: ['build-examples', 'test-ci'],
	})
}
