import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	//see https://github.com/laravel/vite-plugin/blob/73466441b0c9eb0c1a5ce0a0e937bd83eaef4b70/.github/workflows/tests.yml#L10
	process.env.LARAVEL_BYPASS_ENV_CHECK="1";
	await runInRepo({
		...options,
		repo: 'laravel/vite-plugin',
		build: 'build',
		test: 'test'
	})
}
