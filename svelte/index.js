import { $ } from 'zx'
import { resolve } from 'path'
import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  const pluginPath = resolve(workspace, 'vite-plugin-svelte')

  await runInRepo({
    repo: 'git@github.com:sveltejs/vite-plugin-svelte.git',
    folder: pluginPath,
    verify: true,
    test: true,
    buildTask: async() => $`pnpm build:ci`,
    testTask: async() => $`pnpm test:ci`,
  })

  await runInRepo({
    repo: 'git@github.com:sveltejs/kit.git',
    ref: 'master',
    folder: resolve(workspace, 'kit'),
    verify: true,
    test: true,
    overrides: {"@sveltejs/vite-plugin-svelte":`${pluginPath}/packages/vite-plugin-svelte`},
    buildTask: async() => $`pnpm build --filter ./packages --filter !./packages/create-svelte/templates`,
    testTask: async() => $`pnpm test`,
  })
}
