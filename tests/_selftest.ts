import path from 'path'
import fs from 'fs'
import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'sveltejs/svelte-ecosystem-ci',
		build: async () => {
			const dir = path.resolve(options.workspace, 'svelte-ecosystem-ci')
			const pkgFile = path.join(dir, 'package.json')
			const pkg = JSON.parse(await fs.promises.readFile(pkgFile, 'utf-8'))
			if (pkg.name !== 'svelte-ecosystem-ci') {
				throw new Error(
					`invalid checkout, expected package.json with "name":"svelte-ecosystem-ci" in ${dir}`,
				)
			}
			pkg.scripts.selftestscript =
				"[ -f ../../svelte/packages/svelte/compiler.cjs ] || (echo 'svelte build failed' && exit 1)"
			await fs.promises.writeFile(
				pkgFile,
				JSON.stringify(pkg, null, 2),
				'utf-8',
			)
		},
		test: 'pnpm run selftestscript',
		verify: false,
	})
}
