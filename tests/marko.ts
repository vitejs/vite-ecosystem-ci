import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'marko-js/vite',
		dir: 'marko', // default is last segment of repo, which would be vite and confusing
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
		overrides: {
			esbuild: `${options.vitePath}/packages/vite/node_modules/esbuild`,
		},
	})
}
