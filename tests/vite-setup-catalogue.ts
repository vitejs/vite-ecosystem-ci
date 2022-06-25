import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sapphi-red/vite-setup-catalogue',
		branch: 'main',
		test: 'test-for-ecosystem-ci',
		useCopyForOverrides: true // needs copy because node_modules is mounted on docker container
	})
}
