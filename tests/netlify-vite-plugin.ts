import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'netlify/primitives',
		build: 'npm run build --workspaces',
		beforeTest: 'npx playwright install chromium',
		test: ['npm run test -w packages/vite-plugin'],
	})
}
