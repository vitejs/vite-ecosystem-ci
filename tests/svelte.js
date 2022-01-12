import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  
  const { dir: pluginPath } = await runInRepo({
    repo: 'sveltejs/vite-plugin-svelte',
    build: 'build:ci',
    test: 'test:ci',
    verify: true,
    workspace,
  })

  await runInRepo({
    repo: 'sveltejs/kit',
    ref: 'master',
    overrides: {"@sveltejs/vite-plugin-svelte":`${pluginPath}/packages/vite-plugin-svelte`},
    build: 'build --filter ./packages --filter !./packages/create-svelte/templates',
    test: 'test',
    verify: true,
    workspace,
  })
}
