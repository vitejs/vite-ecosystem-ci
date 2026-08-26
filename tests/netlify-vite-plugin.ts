import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'netlify/framework-adapters',
		build: 'npm run build -w packages/vite-plugin',
		beforeTest: 'npx playwright install chromium',
		test: 'test:vite-ecosystem-ci',
	})
}
