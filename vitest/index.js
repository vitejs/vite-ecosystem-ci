import { $ } from 'zx'
import { resolve } from 'path'
import { setup, setupVite, runInRepo, dirnameFrom } from '../utils.js'

// this script requires git, pnpm and jq to be installed and in path

const workspace = dirnameFrom(import.meta.url)

await setup()

await setupVite({ verify: false })

await runInRepo({
  repo: 'git@github.com:vitest-dev/vitest',
  folder: resolve(workspace, 'vitest'),
  verify: true,
  test: true,
  buildTask: async() => $`pnpm build`,
  testTask: async() => $`pnpm test:run`
})
