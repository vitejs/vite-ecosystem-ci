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
			// Add `vitest.config.ts` to exclude Vite from inlined by Vitest.
			// Otherwise the mock here doesn't work.
			// https://github.com/laravel/vite-plugin/blob/3f7bf9eddc69580796c26890c99065d7259c785e/tests/index.test.ts#L7-L22
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
