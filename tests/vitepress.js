import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  
  await runInRepo({
    repo: 'vuejs/vitepress',
    build: 'build',
    test: 'test',
    verify: true,
    workspace,
  })
}
