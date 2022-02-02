import fs from 'fs'
import path from 'path'
import process from 'process'
import { cac } from 'cac'

import { setupEnvironment, setupViteRepo, buildVite, bisectVite } from './utils'
import { CommandOptions, RunOptions } from './types'

const cli = cac()
cli
	.command('[...suites]', 'build vite and run selected suites')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--branch <branch>', 'vite branch to use', { default: 'main' })
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options: CommandOptions) => {
		const { root, vitePath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		await setupViteRepo(options)
		await buildVite({ verify: options.verify })
		const runOptions: RunOptions = {
			root,
			vitePath,
			workspace,
			verify: options.verify != null ? options.verify : false,
			skipGit: false
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
		await setupEnvironment()
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
		const { root, vitePath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
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
	.option('--good <ref>', 'last known good ref, e.g. a previous tag. REQUIRED!')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--branch <branch>', 'vite branch to use', { default: 'main' })
	.option('--tag <tag>', 'vite tag to use')
	.option('--commit <commit>', 'vite commit sha to use')
	.action(async (suites, options: CommandOptions & { good: string }) => {
		if (!options.good) {
			console.log(
				'you have to specify a known good version with `--good <commit|tag>`'
			)
			process.exit(1)
		}
		const { root, vitePath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let isFirstRun = true
		const { verify } = options
		const runSuite = async () => {
			try {
				await buildVite({ verify: isFirstRun && verify })
				for (const suite of suitesToRun) {
					await run(suite, {
						verify: !!(isFirstRun && verify),
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
			await bisectVite(options.good, runSuite)
		} else {
			console.log(`no errors for starting commit, cannot bisect`)
		}
	})
cli.help()
cli.parse()

async function run(suite: string, options: RunOptions) {
	// eslint-disable-next-line node/no-unsupported-features/es-syntax
	const { test } = await import(`./tests/${suite}.js`)
	await test({
		...options,
		workspace: path.resolve(options.workspace, suite)
	})
}

function getSuitesToRun(suites: string[], root: string) {
	let suitesToRun: string[] = suites
	const availableSuites: string[] = fs
		.readdirSync(path.join(root, 'tests'))
		.filter((f: string) => !f.startsWith('_') && f.endsWith('.ts'))
		.map((f: string) => f.slice(0, -3))
	availableSuites.sort()
	if (suitesToRun.length === 0) {
		suitesToRun = availableSuites
	} else {
		const invalidSuites = suitesToRun.filter(
			(x) => !x.startsWith('_') && !availableSuites.includes(x)
		)
		if (invalidSuites.length) {
			console.log(`invalid suite(s): ${invalidSuites.join(', ')}`)
			console.log(`available suites: ${availableSuites.join(', ')}`)
			process.exit(1)
		}
	}
	return suitesToRun
}
