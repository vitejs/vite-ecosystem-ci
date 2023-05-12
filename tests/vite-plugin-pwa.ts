import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vite-pwa/vite-plugin-pwa',
		branch: 'userquin/feat-add-tests',
		overrides: {
			svelte: 'latest',
			react: 'latest',
			preact: 'latest',
			vue: 'latest',
			'solid-js': 'latest',
		},
		beforeTest: 'pnpm playwright install',
		test: ['build', 'test'],
	})
}
