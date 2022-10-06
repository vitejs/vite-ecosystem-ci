import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'laravel/vite-plugin',
		//env from https://github.com/laravel/vite-plugin/blob/73466441b0c9eb0c1a5ce0a0e937bd83eaef4b70/.github/workflows/tests.yml#L10
		build: 'LARAVEL_BYPASS_ENV_CHECK=1 npm run build',
		test: 'LARAVEL_BYPASS_ENV_CHECK=1 npm run test'
	})
}
