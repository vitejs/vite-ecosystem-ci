import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	if (options.viteMajor < 4) {
		// only latest version
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
		build: 'build',
		test: 'test',
	})
}
