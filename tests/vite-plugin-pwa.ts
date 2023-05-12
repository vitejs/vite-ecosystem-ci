import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	if (options.viteMajor < 4) {
		// no branch with 3.0 version
		// ts test will fail since asset hash separator now is rollup default (-) instead dot (.)
		return
	}

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
