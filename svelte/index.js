import { $ } from 'zx'
import { resolve } from 'path'
import { setup, setupVite, runInRepo, dirnameFrom } from '../utils.js'

// this script requires git and pnpm

const workspace = dirnameFrom(import.meta.url)
const pluginPath = resolve(workspace, 'vite-plugin-svelte')

await setup()

await setupVite({ verify: false })

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
