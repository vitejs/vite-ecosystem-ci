import { $ } from 'zx'
import { resolve } from 'path'
import { setup, updateVite, testInLatest, dirnameFrom } from '../utils.js'

// this script requires git, pnpm and jq to be installed and in path

const workspace = dirnameFrom(import.meta.url)

await setup()

await updateVite({ verify: false })

await testInLatest({ 
  repo: 'git@github.com:sveltejs/vite-plugin-svelte.git', 
  folder: resolve(workspace, 'vite-plugin-svelte'),
  verify: true,
  test: true,
  task: async() => {
    await $`pnpm build:ci`
    await $`pnpm test:ci`
  }
})

await testInLatest({ 
  repo: 'git@github.com:sveltejs/kit.git',
  ref: 'master',
  folder: resolve(workspace, 'kit'),
  verify: true,
  test: true,
  task: async() => {
    await $`pnpm build --filter ./packages --filter !./packages/create-svelte/templates`
    await $`pnpm test`
  }
})
