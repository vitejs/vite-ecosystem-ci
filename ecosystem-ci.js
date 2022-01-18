import fs from 'fs'
import path from 'path'
import { cac } from 'cac'

import { setupUtils, setupViteRepo, buildVite, bisectVite } from './utils.js'

const cli = cac()
cli
	.command('[...suites]', 'build vite and run selected suites')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--branch <branch>', 'vite branch to use', { default: 'main' })
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options) => {
		const { root, vitePath, workspace } = await setupUtils()
		const suitesToRun = getSuitesToRun({ suites, root })
		await setupViteRepo(options)
		await buildVite({ verify: options.verify })
		const runOptions = {
			...options,
			root,
			vitePath,
			workspace
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command('build-vite', 'build vite only')
	.option('--verify', 'verify vite checkout by running tests', {
		default: false
	})
	.option('--branch <branch>', 'vite branch to use', { default: 'main' })
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (options) => {
		await setupUtils()
		await setupViteRepo(options)
		await buildVite({ verify: options.verify })
	})

cli
	.command('run-suites [...suites]', 'run single suite with pre-built vite')
	.option(
		'--verify',
		'verify checkout by running tests before using local vite',
		{ default: false }
	)
	.action(async (suites, options) => {
		const { root, vitePath, workspace } = await setupUtils()
		const suitesToRun = getSuitesToRun({ suites, root })
		const runOptions = {
			...options,
			root,
			vitePath,
			workspace
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command(
		'bisect [...suites]',
		'use git bisect to find a commit in vite that broke suites'
	)
	.option('--good <ref>', 'last known good ref, e.g. a previous tag', {
		required: true
	})
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--branch <branch>', 'vite branch to use', { default: 'main' })
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options) => {
		const { root, vitePath, workspace } = await setupUtils()
		const suitesToRun = getSuitesToRun({ suites, root })
		let isFirstRun = true
		const { verify } = options
		const runSuite = async () => {
			try {
				await buildVite({ verify: isFirstRun && verify })
				for (const suite of suitesToRun) {
					await run(suite, {
						verify: isFirstRun && verify,
						skipGit: !isFirstRun,
						root,
						vitePath,
						workspace
					})
				}
				isFirstRun = false
				return null
			} catch (e) {
				return e
			}
		}
		await setupViteRepo({ ...options, shallow: false })
		const initialError = await runSuite()
		if (initialError) {
			await bisectVite({ good: options.good, runSuite })
		} else {
			console.log(`no errors for starting commit, cannot bisect`)
		}
	})
cli.help()
cli.parse()

async function run(
	suite,
	{ verify = true, skipGit = false, workspace, root, vitePath }
) {
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const { test } = await import(`./tests/${suite}.js`)
	await test({
		workspace: path.resolve(workspace, suite),
		root,
		vitePath,
		verify,
		skipGit
	})
}

function getSuitesToRun({ suites = [], root }) {
	let suitesToRun = suites
	const availableSuites = fs
		.readdirSync(path.join(root, 'tests'))
		.filter((f) => f.endsWith('.js'))
		.map((f) => f.slice(0, -3))
		.sort()
	if (suitesToRun.length === 0) {
		suitesToRun = availableSuites
	} else {
		const invalidSuites = suitesToRun.filter(
			(x) => !availableSuites.includes(x)
		)
		if (invalidSuites.length) {
			console.log(`invalid suite values: ${invalidSuites.join(', ')}`)
			console.log(`available suites: ${availableSuites.join(', ')}`)
			process.exit(1)
		}
	}
	return suitesToRun
}
