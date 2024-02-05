import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'skeletonlabs/skeleton',
		branch: 'dev',
		test: ['test', 'check'].map(
			(script) => `pnpm --dir packages/skeleton ${script}`,
		),
		overrides: {
			'svelte-check': 'latest', // needed for svelte-4, should be `true` but language-tools build still fails
		},
	})
}
