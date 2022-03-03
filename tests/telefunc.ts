import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vikejs/telefunc',
		beforeInstall: 'setup', // Needed for submodule initialization
		build: 'build',
		test: 'test'
	})
}
