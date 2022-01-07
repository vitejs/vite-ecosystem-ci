import { $ } from 'zx'
import { resolve } from 'path'
import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  const pluginPath = resolve(workspace, 'vite-plugin-svelte')

  await runInRepo({
    repo: 'git@github.com:sveltejs/vite-plugin-svelte.git',
    folder: pluginPath,
    build: 'build:ci',
    test: 'test:ci',
    verify: true,
  })

  await runInRepo({
    repo: 'git@github.com:sveltejs/kit.git',
    ref: 'master',
    folder: resolve(workspace, 'kit'),
    overrides: {"@sveltejs/vite-plugin-svelte":`${pluginPath}/packages/vite-plugin-svelte`},
    build: 'build --filter ./packages --filter !./packages/create-svelte/templates',
    test: 'test',
    verify: true,
  })
}
