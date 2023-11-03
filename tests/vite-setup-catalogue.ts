import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sapphi-red/vite-setup-catalogue',
		branch: 'main',
		test: 'test-for-ecosystem-ci',
	})
}
