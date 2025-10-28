import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'
import path from 'node:path'
import fs from 'node:fs'

export async function test(options: RunOptions) {
	//see https://github.com/laravel/vite-plugin/blob/73466441b0c9eb0c1a5ce0a0e937bd83eaef4b70/.github/workflows/tests.yml#L10
	process.env.LARAVEL_BYPASS_ENV_CHECK = '1'
	await runInRepo({
		...options,
		repo: 'laravel/vite-plugin',
		branch: '2.x',
		build: 'build',
		async beforeTest() {
			const dir = path.resolve(options.workspace, 'vite-plugin')
			const vitestConfigFile = path.join(dir, 'vitest.config.ts')
			fs.writeFileSync(
				vitestConfigFile,
				getVitestConfig(options.vitePath),
				'utf-8',
			)
		},
		test: 'test',
		agent: 'npm',
	})
}

const getVitestConfig = (viteRepoPath: string) => /* ts */ `
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        deps: {
            moduleDirectories: [
                ${JSON.stringify(path.resolve(viteRepoPath, 'packages'))},
            ],
        },
    },
});
`
