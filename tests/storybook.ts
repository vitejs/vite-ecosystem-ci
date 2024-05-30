import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.d.ts'

export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'storybookjs/repro-templates-temp',
		dir: 'storybook7',
		testSubdirectory: 'react-vite/default-js/after-storybook',
		branch: 'next',
		build: ['build-storybook'],
		test: [
			'yarn add --dev @storybook/test-runner http-server concurrently',
			'npx concurrently -k "http-server storybook-static --port 6006 --silent" "npx wait-on http://localhost:6006 && npx test-storybook"',
		],
	})
}
