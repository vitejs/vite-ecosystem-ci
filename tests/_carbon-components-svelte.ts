import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'carbon-design-system/carbon-components-svelte',
		branch: 'master',
		build: 'build:lib',
		test: 'test:types',
		overrides: {
			'rollup-plugin-svelte': true,
			'svelte-check': 'latest', // should be true but building it is currently broken
		},
	})
}
