import {runInRepo} from '../utils.js'

export async function test({workspace, verify = true, skipGit}) {
	await runInRepo({
		repo: 'ElMassimo/iles',
		build: 'build:all',
		test: 'test',
		verify,
		workspace,
		skipGit
	})
}
