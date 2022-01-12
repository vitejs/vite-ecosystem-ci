import fs from 'fs'
import path from 'path'
import { setup, setupVite } from './utils.js'

// this script requires git and pnpm to be installed and in path

const { root, vitePath, workspace } = await setup()

const { suitesToRun, skipViteBuild } = parseArgs()

if(!skipViteBuild) {
  await setupVite({ verify: false })
}
for(const suite of suitesToRun) {
  await run(suite)
}

async function run(suite) {
  const { test } = await import(`./tests/${suite}.js`)
  await test({ workspace: path.resolve(workspace, suite), root, vitePath })
}

function parseArgs() {
  let args = process.argv.slice(2);
  const viteBuildOnly = args.includes('--viteBuildOnly')
  if(viteBuildOnly) {
    return {suitesToRun: [], skipViteBuild: false}
  }
  const skipViteBuild = args.includes('--skipViteBuild')

  let suitesToRun = args.filter(x => x && !x.startsWith('--'))
  const availableSuites = fs.readdirSync(path.join(root,'tests')).filter(f => f.endsWith('.js')).map(f => f.slice(0,-3)).sort()
  if(suitesToRun.length === 0) {
    suitesToRun = availableSuites
  } else {
    const invalidSuites = suitesToRun.filter(x => !availableSuites.includes(x));
    if(invalidSuites.length){
      console.log(`invalid suite arguments: ${invalidSuites.join(', ')}`)
      console.log(`available suites: ${availableSuites.join(', ')}`)
      process.exit(1)
    }
  }
  return { suitesToRun, skipViteBuild }
}

