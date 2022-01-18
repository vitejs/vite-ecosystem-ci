import { runInRepo } from '../utils.js'

export async function test({ workspace, verify = true, skipGit }) {
	await runInRepo({
		repo: 'vuejs/vitepress',
		build: 'build',
		test: 'test',
		verify,
		workspace,
		skipGit
	})
}
