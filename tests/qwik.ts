import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'BuilderIO/qwik',
		build: 'build.vite',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test.vite'
	})
}
