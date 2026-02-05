import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sapphi-red/astro',
		branch: 'fix/astro-ensure-req-url-has-a-starting-slash',
		build: 'build:ci',
		test: 'test:vite-ci',
	})
}
