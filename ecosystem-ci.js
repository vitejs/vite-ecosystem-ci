import fs from 'fs'
import path from 'path'
import {cac} from 'cac'

import {setup, setupViteRepo, buildVite, bisectVite } from './utils.js'

const {root, vitePath, workspace} = await setup()

const cli = cac()
cli.command('[...suites]', 'build vite and run selected suites')
	.option('--verify', 'verify checkouts by running tests', {default: false})
	.option('--branch <branch>', 'vite branch to use', {default: 'main'})
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options) => {
		const suitesToRun = getSuitesToRun(suites)
		await setupViteRepo(options)
		await buildVite({verify: options.verify})
		for (const suite of suitesToRun) {
			await run(suite, options)
		}
	})

cli.command('build-vite', 'build vite only')
	.option('--verify', 'verify vite checkout by running tests', {default: false})
	.option('--branch <branch>', 'vite branch to use', {default: 'main'})
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (options) => {
		await setupViteRepo(options)
		await buildVite({verify: options.verify})
	})

cli.command('run-suites [...suites]', 'run single suite with pre-built vite')
	.option('--verify', 'verify checkout by running tests before using local vite', {default: false})
	.action(async (suites) => {
		const suitesToRun = getSuitesToRun(suites)
		for (const suite of suitesToRun) {
			await run(suite, options)
		}
	})

cli.command('bisect [...suites]', 'use git bisect to find a commit in vite that broke suites')
	.option('--good <ref>', 'last known good ref, e.g. a previous tag',{required: true})
	.option('--verify', 'verify checkouts by running tests', {default: false})
	.option('--branch <branch>', 'vite branch to use', {default: 'main'})
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options) => {
		const suitesToRun = getSuitesToRun(suites)
		let isFirstRun = true;
		const {verify} = options;
		const runSuite = async () => {
			try {
				await buildVite({verify: isFirstRun && verify})
				for (const suite of suitesToRun) {
					await run(suite, {verify: isFirstRun && verify, skipGit: !isFirstRun})
				}
				isFirstRun = false;
				return null
			} catch (e) {
				return e
			}
		}
		await setupViteRepo({...options,shallow: false});
		const initialError = await runSuite()
		if(initialError) {
			await bisectVite({good: options.good, runSuite})
		} else {
			console.log(`no errors for starting commit, cannot bisect`)
		}

	})
cli.help()
cli.parse()


async function run(suite, {verify = true, skipGit = false}) {
	const {test} = await import(`./tests/${suite}.js`)
	await test({workspace: path.resolve(workspace, suite), root, vitePath, verify, skipGit})
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
