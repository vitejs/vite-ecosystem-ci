import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'skeletonlabs/skeleton',
		branch: 'main',
		build: 'pnpm --dir packages/skeleton-svelte build',
		test: ['test', 'check'].map(
			(script) => `pnpm --dir packages/skeleton-svelte ${script}`,
		),
	})
}
