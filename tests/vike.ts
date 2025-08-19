import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vikejs/vike',
		branch: 'main',
		overrides: {
			'@vitejs/plugin-react': true,
			'@vitejs/plugin-vue': true,
		},
		build: 'build',
		beforeTest: 'pnpm exec playwright install chromium',
		test: 'test:vite-ecosystem-ci',
	})
}

export const rolldownViteExpectedFailureReason = `
needs to be update on vike side (tests)
`
