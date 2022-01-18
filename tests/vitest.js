import { runInRepo } from '../utils.js'

export async function test({ workspace, verify = true, skipGit }) {
	await runInRepo({
		repo: 'vitest-dev/vitest',
		build: 'build',
		test: 'test:run',
		verify,
		workspace,
		skipGit
	})
}
