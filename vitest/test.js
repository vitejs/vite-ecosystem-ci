import { $ } from 'zx'
import { resolve } from 'path'
import { setup, updateVite, testInLatest, dirnameFrom } from '../utils.js'

// this script requires git, pnpm and jq to be installed and in path

const workspace = dirnameFrom(import.meta.url)

await setup()

await updateVite({ verify: false })

await testInLatest({ 
  repo: 'git@github.com:vitest-dev/vitest', 
  folder: resolve(workspace, 'vitest'),
  verify: true,
  test: true,
  task: async() => {
    await $`pnpm build`
    await $`pnpm test:run`
  }
})