import { resolve } from 'path'
import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  await runInRepo({
    repo: 'git@github.com:vitest-dev/vitest',
    folder: resolve(workspace, 'vitest'),
    build: 'build',
    test: 'test:run',
    verify: true,
  })
}
