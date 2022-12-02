import { runInRepo } from '../utils'
import { RunOptions } from '../types'

export async function test(options: RunOptions) {
	const { dir: vitePluginReact } = await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react',
		branch: 'main',
		build: 'build',
		test: 'echo skipping tests, just building'
	})
	const { dir: vitePluginVue } = await runInRepo({
		...options,
		repo: 'vitejs/vite-plugin-react',
		branch: 'main',
		build: 'build',
		test: 'echo skipping tests, just building'
	})
	await runInRepo({
		...options,
		repo: 'brillout/vite-plugin-ssr',
		branch: 'main',
		overrides:{
			"@vitejs/plugin-react":`${vitePluginReact}/packages/plugin-react`,
			"@vitejs/plugin-vue":`${vitePluginVue}/packages/plugin-vue`,
			"@vitejs/plugin-vue-jsx":`${vitePluginVue}/packages/plugin-vue-jsx`,
		},
		build: 'build',
		test: 'test'
	})
}
