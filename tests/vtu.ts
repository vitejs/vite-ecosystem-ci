import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vuejs/test-utils',
		overrides: {
			'vue-tsc': true,
		},
		branch: 'main',
		test: 'vue-tsc',
	})
}
