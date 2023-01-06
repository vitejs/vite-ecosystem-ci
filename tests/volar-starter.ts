import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'johnsoncodehk/volar-starter',
		overrides: {
			'vue-tsc': true,
		},
		branch: 'master',
		test: 'build',
	})
}
