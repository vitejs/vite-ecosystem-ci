import { runInRepo } from '../utils.ts'
import { RunOptions } from '../types.ts'

// TODO currently the tests around svelte are very few in histoire
const scripts_to_test = {
	'examples/svelte3': ['test:examples'],
	// TODO sveltekit example in histoire is broken
	//'examples/sveltekit':['sk:build','story:build']
}
function test_command(dir: string, cmd: string) {
	return `pnpm --dir ${dir} --if-present run ${cmd}`
}

const tests = Object.entries(scripts_to_test)
	.map(([dir, cmds]) => cmds.map((cmd) => test_command(dir, cmd)))
	.flat()
export async function test(options: RunOptions) {
	await runInRepo({
		...options,
		repo: 'histoire-dev/histoire',
		branch: 'main',
		build: 'build',
		overrides: {
			'@sveltejs/vite-plugin-svelte': true,
			'@sveltejs/kit': true,
			'@sveltejs/adapter-auto': true,
			// TODO link more packages?
			// '@sveltejs/adapter-node': true,
			// '@sveltejs/adapter-static': true
		},
		test: tests,
	})
}
