import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react-swc',
		beforeBuild: 'tsc',
		build: 'build',
		beforeTest: 'pnpm playwright install chromium',
		test: 'test',
	})
}
