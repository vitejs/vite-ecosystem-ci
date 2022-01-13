import fs from 'fs'
import path from 'path'
import {cac} from 'cac'

import {setup, setupVite} from './utils.js'

const {root, vitePath, workspace} = await setup()

const cli = cac()
cli.command('[...suites]', 'build vite and run selected suites')
	.option('--verify', 'verify vite checkout by running tests', {default: false})
	.option('--branch <branch>', 'vite branch to use', {default: 'main'})
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options) => {
		const suitesToRun = getSuitesToRun(suites)
		await setupVite(options)
		for (const suite of suitesToRun) {
			await run(suite)
		}
	})

cli.command('build-vite', 'build vite only')
	.option('--verify', 'verify vite checkout by running tests', {default: false})
	.option('--branch <branch>', 'vite branch to use', {default: 'main'})
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (options) => {
		await setupVite(options)
	})

cli.command('run-suites [...suites]', 'run single suite with pre-built vite')
	.action(async (suites) => {
		const suitesToRun = getSuitesToRun(suites)
		for (const suite of suitesToRun) {
			await run(suite)
		}
	})
cli.help()
cli.parse()


async function run(suite) {
	const {test} = await import(`./tests/${suite}.js`)
	await test({workspace: path.resolve(workspace, suite), root, vitePath})
}

function getSuitesToRun(suitesArg) {
	let suitesToRun = suitesArg || []
	const availableSuites = fs.readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).sort()
	if (suitesToRun.length === 0) {
		suitesToRun = availableSuites
	} else {
		const invalidSuites = suitesToRun.filter(x => !availableSuites.includes(x));
		if (invalidSuites.length) {
			console.log(`invalid suite values: ${invalidSuites.join(', ')}`)
			console.log(`available suites: ${availableSuites.join(', ')}`)
			process.exit(1)
		}
	}
	return suitesToRun
}
