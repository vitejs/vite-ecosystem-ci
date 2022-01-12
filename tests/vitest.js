import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  
  await runInRepo({
    repo: 'vitest-dev/vitest',
    build: 'build',
    test: 'test:run',
    verify: true,
    workspace,
  })
}
