import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'rakkasjs/rakkasjs',
		branch: 'main',
		build: 'build',
		// This is needed to run puppeteer in Ubuntu 23+
		// https://github.com/puppeteer/puppeteer/pull/13196
		beforeTest: process.env.GITHUB_ACTIONS
			? 'sudo tee /proc/sys/kernel/apparmor_restrict_unprivileged_userns'
			: undefined,
		test: 'vite-ecosystem-ci',
	})
}
