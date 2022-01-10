import { resolve } from 'path'
import { setup, setupVite } from './utils.js'

const suites = [
  'iles',
  'svelte',
  'vitest',
  'windicss'
]

// this script requires git and pnpm to be installed and in path

const { suitesToRun, skipViteBuild } = parseArgs()

const { root, vitePath, workspace } = await setup()

if(!skipViteBuild) {
  await setupVite({ verify: false })
}

for(const suite of suitesToRun) {
  await run(suite)
}

async function run(suite) {
  const { test } = await import(`./${suite}/index.js`)
  await test({ workspace: resolve(workspace, suite), root, vitePath })
}

function parseArgs() {
  let suitesToRun = process.argv.slice(2);
  const skipViteBuild = suitesToRun.includes('--skipViteBuild')
  if(skipViteBuild){
    suitesToRun = suitesToRun.filter(x => x !== '--skipViteBuild')
  }
  if (!suitesToRun.length) {
    suitesToRun = suites
  }
  return { suitesToRun, skipViteBuild }
}

