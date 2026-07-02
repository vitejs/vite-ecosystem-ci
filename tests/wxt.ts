import { runInRepo } from '../utils.ts'
import type { RunOptions } from '../types.ts'

export async function test(options: RunOptions) {
  await runInRepo({
    ...options,
    repo: 'wxt-dev/wxt',
    branch: 'main',
    build: 'bun run --filter wxt build',
    test: 'bun run --filter wxt test run',
  })
}
