import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react-pages',
		overrides: {
			'@vitejs/plugin-react': true,
		},
		branch: options.viteMajor === 4 ? 'dev/v4' : 'main',
		build: 'build:docs',
		beforeTest: 'playwright install --with-deps chromium',
		test: 'test',
	})
}
