import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'volarjs/angular-language-tools',
		branch: 'master',
		test: 'build',
	})
}
