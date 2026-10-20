import fs from 'node:fs/promises'
import path from 'node:path'
import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'cloudflare/vinext',
		branch: 'main',
		beforeInstall: [
			'vite-ecosystem-ci:before-install',
			// [workaround for https://github.com/voidzero-dev/vite-plus/issues/3135]
			// Keep undeclared packages out of isolated test fixtures.
			'pnpm config set extend-node-path false --location project',
			async () => {
				const dir = path.join(options.workspace, 'vinext')
				for await (const file of fs.glob('packages/*/package.json', { cwd: dir })) {
					const pkgFile = path.join(dir, file)
					const pkg = JSON.parse(await fs.readFile(pkgFile, 'utf-8'))
					if (pkg.scripts?.build !== 'vp pack') continue
					// The vp dispatcher rejects the upstream Vite override. Use the same
					// bundled pack entry directly, keeping vinext's build configuration.
					pkg.scripts.build = 'node ../../node_modules/vite-plus/dist/pack-bin.js'
					await fs.writeFile(pkgFile, JSON.stringify(pkg, null, 2) + '\n')
				}
			},
		],
		build: 'vite-ecosystem-ci:build',
	  // [workaround for https://github.com/voidzero-dev/vite-plus/issues/3135]
		beforeTest: async () => {
			const dir = path.join(options.workspace, 'vinext')
			// Some tests import Vite APIs through Vite+, which re-exports its own core.
			// Point those imports at the Vite under test, preserving vite-plus/test.
			for await (const file of fs.glob('tests/*.ts', { cwd: dir })) {
				const testFile = path.join(dir, file)
				const source = await fs.readFile(testFile, 'utf-8')
				const updated = source
					.replace(/(\bfrom\s+|\bimport\s*\()(["'])vite-plus\2/g, '$1$2vite$2')
					// Exercise the upstream CLI in command-contract tests as well.
					.replaceAll('execFileSync(VP_PATH, [', 'execFileSync(process.execPath, [VITE_CLI_PATH, ')
					// Vite+ and upstream Vite have different internal CLI layouts.
					.replaceAll(
						'path.join(path.dirname(fileURLToPath(import.meta.resolve("vite"))), "cli.js")',
						'fileURLToPath(new URL("bin/vite.js", import.meta.resolve("vite/package.json")))',
					)
				if (updated !== source) await fs.writeFile(testFile, updated)
			}
		},
		test: 'vite-ecosystem-ci:test',
		overrides: {
			'@vitejs/plugin-rsc': true,
			// [workaround for https://github.com/voidzero-dev/vite-plus/issues/3135]
			// Pack requires Vite+'s core; vinext and Vitest still use the Vite under test.
			'vite-plus>vite': 'catalog:',
		},
	})
}
