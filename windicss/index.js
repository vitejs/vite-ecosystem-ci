import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  
  await runInRepo({
    repo: 'windicss/vite-plugin-windicss',
    build: 'build',
    test: 'test',
    verify: true,
    workspace,
  })
}
