import { RunOptions } from '../types'
import { runInRepo } from '../utils'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'fwouts/previewjs',
		branch: 'main',
		build: 'turbo build',
		test: ['turbo e2e-test -- --workers=1']
	})
}
