import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'Cammisuli/monodon',
		branch: 'main',
		build: ['build rust'],
		test: ['test rust'],
		e2e: ['e2e rust-e2e'],
	})
}
