import fs from 'node:fs/promises'
import path from 'node:path'
import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'seedcord/seedcord',
		branch: 'next',
		// [workaround for https://github.com/voidzero-dev/vite-plus/issues/3135]
		// The vp dispatcher rejects the upstream Vite override. Run the same
		// bundled pack entry directly, keeping each package's pack config.
		beforeInstall: async () => {
			const dir = path.join(options.workspace, 'seedcord')
			for await (const file of fs.glob('*/*/package.json', { cwd: dir })) {
				const pkgFile = path.join(dir, file)
				const pkg = JSON.parse(await fs.readFile(pkgFile, 'utf-8'))
				if (pkg.scripts?.build !== 'vp pack') continue
				pkg.scripts.build = 'node ../../node_modules/vite-plus/dist/pack-bin.js'
				await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2) + '\n')
			}
		},
		build: 'turbo build --filter=seedcord...',
		test: 'pnpm --filter seedcord test:vite',
		overrides: {
			// [workaround for https://github.com/voidzero-dev/vite-plus/issues/3135]
			// Pack and the test runner need Vite+'s core. seedcord still imports the Vite under test.
			'vite-plus>vite': 'catalog:deps',
		},
	})
}
