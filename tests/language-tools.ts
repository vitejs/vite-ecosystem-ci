import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/language-tools',
		branch: 'master',
		beforeBuild: 'bootstrap',
		build: 'build',
		test: 'test',
	})
}
