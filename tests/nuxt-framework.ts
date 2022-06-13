import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'nuxt/framework',
		branch: 'chore/vite-3',
		build: 'build',
		test: ['test:fixtures', 'test:types']
	})
}
