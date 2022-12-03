import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/kit',
		branch: options.viteMajor === 4 ? 'vite-4' : 'master',
		overrides: {
			svelte: 'latest',
			'@sveltejs/vite-plugin-svelte': true,
		},
		beforeTest: 'pnpm playwright install',
		test: ['lint', 'check', 'test']
	})
}
