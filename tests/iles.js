import { runInRepo } from '../utils.js'

export async function test({ workspace }) {
  await runInRepo({
    repo: 'ElMassimo/iles',
    build: 'build:all',
    test: 'test',
    verify: true,
    workspace,
  })
}
