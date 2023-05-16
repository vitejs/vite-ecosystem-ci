import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'qwikifiers/qwik-nx',
		branch: 'main',
		build: ['build qwik-nx'],
		test: ['test qwik-nx'],
	})
}
