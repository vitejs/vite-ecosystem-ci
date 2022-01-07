import { resolve } from 'path'
import { setup, setupVite } from './utils.js'

const suites = ['svelte', 'vitest', 'iles']

// this script requires git, pnpm and jq to be installed and in path

const { suitesToRun } = parseArgs()

const { root, vitePath, workspace } = await setup()

await setupVite({ verify: false })

for(const suite of suitesToRun) {
  await run(suite)
}

async function run(suite) {
  const { test } = await import(`./${suite}/index.js`)
  await test({ workspace: resolve(workspace, suite), root, vitePath })
}

function parseArgs() {
  let suitesToRun = process.argv.slice(2);
  if (!suitesToRun.length) {
    suitesToRun = suites
  }
  return { suitesToRun }
}

