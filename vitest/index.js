import { $ } from 'zx'
import { resolve } from 'path'
import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  await runInRepo({
    repo: 'git@github.com:vitest-dev/vitest',
    folder: resolve(workspace, 'vitest'),
    verify: true,
    test: true,
    buildTask: async() => $`pnpm build`,
    testTask: async() => $`pnpm test:run`
  })
}
