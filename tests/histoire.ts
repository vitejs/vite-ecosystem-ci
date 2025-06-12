import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'histoire-dev/histoire',
		branch: 'main',
		build: 'build',
		test: ['test', 'test:examples'],
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be updated on histoire side (manualChunks)
`
