import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'netlify/framework-adapters',
		agent: 'npm',
		build: 'npm run build -w packages/vite-plugin',
		beforeTest: 'npx playwright install chromium',
		test: ['env COPY_OVERRIDES_TO_FIXTURES=true npm run test -w packages/vite-plugin'],
	})
}
