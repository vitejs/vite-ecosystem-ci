import path from 'path'
import fs from 'fs'
import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'vitejs/vite-ecosystem-ci',
		build: async () => {
			const dir = path.resolve(options.workspace, 'vite-ecosystem-ci')
			const pkgFile = path.join(dir, 'package.json')
			const pkg = JSON.parse(await fs.promises.readFile(pkgFile, 'utf-8'))
			if (pkg.name !== 'vite-ecosystem-ci') {
				throw new Error(
					`invalid checkout, expected package.json with "name":"vite-ecosystem-ci" in ${dir}`,
				)
			}
			if (options.release?.startsWith('https://pkg.pr.new/vite@')) {
				pkg.scripts.selftestscript =
					"[ -d ./node_modules/vite ] || (echo 'vite build failed' && exit 1)"
			} else {
				pkg.scripts.selftestscript =
					"[ -d ../../vite/packages/vite/dist ] || (echo 'vite build failed' && exit 1)"
			}
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
