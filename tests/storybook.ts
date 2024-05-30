import { $, runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'
import { getCommand } from '@antfu/ni'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/sandboxes',
		dir: 'next',
		testSubdirectory: 'react-vite/default-ts/after-storybook',
		branch: 'next',
		build: ['build-storybook'],
		beforeTest: async (agent) => {
			$`${getCommand(agent, 'execute', ['http-server', 'storybook-static', '--port 6006', '--silent'])}`
			await $`${getCommand(agent, 'execute', ['wait-on', 'http://localhost:6006'])}`
		},
		test: async (agent) => {
			await $`${getCommand(agent, 'execute', ['@storybook/test-runner'])}`
			await $`${getCommand(agent, 'execute', ['fkill-cli', ':6006'])}`
		},
	})
}
