import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'volarjs/language-tools-starter',
		branch: 'master',
		test: 'build',
	})
}
