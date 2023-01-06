import fs from 'fs'
import path from 'path'
import process from 'process'
import { cac } from 'cac'

import {
	setupEnvironment,
	setupVolarRepo,
	buildVolar,
	bisectVolar,
	parseVolarMajor,
	parseMajorVersion,
} from './utils'
import { CommandOptions, RunOptions } from './types'

const cli = cac()
cli
	.command('[...suites]', 'build volar and run selected suites')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--repo <repo>', 'volar repository to use', {
		default: 'johnsoncodehk/volar',
	})
	.option('--branch <branch>', 'volar branch to use', { default: 'master' })
	.option('--tag <tag>', 'volar tag to use')
	.option('--commit <commit>', 'volar commit sha to use')
	.option('--release <version>', 'volar release to use from npm registry')
	.action(async (suites, options: CommandOptions) => {
		const { root, volarPath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let volarMajor
		if (!options.release) {
			await setupVolarRepo(options)
			await buildVolar({ verify: options.verify })
			volarMajor = parseVolarMajor(volarPath)
		} else {
			volarMajor = parseMajorVersion(options.release)
		}
		const runOptions: RunOptions = {
			root,
			volarPath: volarPath,
			volarMajor: volarMajor,
			workspace,
			release: options.release,
			verify: options.verify,
			skipGit: false,
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command('build-volar', 'build volar only')
	.option('--verify', 'verify volar checkout by running tests', {
		default: false,
	})
	.option('--repo <repo>', 'volar repository to use', {
		default: 'johnsoncodehk/volar',
	})
	.option('--branch <branch>', 'volar branch to use', { default: 'master' })
	.option('--tag <tag>', 'volar tag to use')
	.option('--commit <commit>', 'volar commit sha to use')
	.action(async (options: CommandOptions) => {
		await setupEnvironment()
		await setupVolarRepo(options)
		await buildVolar({ verify: options.verify })
	})

cli
	.command('run-suites [...suites]', 'run single suite with pre-built volar')
	.option(
		'--verify',
		'verify checkout by running tests before using local volar',
		{ default: false },
	)
	.option('--repo <repo>', 'volar repository to use', {
		default: 'johnsoncodehk/volar',
	})
	.option('--release <version>', 'volar release to use from npm registry')
	.action(async (suites, options: CommandOptions) => {
		const { root, volarPath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		const runOptions: RunOptions = {
			...options,
			root,
			volarPath,
			volarMajor: parseVolarMajor(volarPath),
			workspace,
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command(
		'bisect [...suites]',
		'use git bisect to find a commit in volar that broke suites',
	)
	.option('--good <ref>', 'last known good ref, e.g. a previous tag. REQUIRED!')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--repo <repo>', 'volar repository to use', {
		default: 'johnsoncodehk/volar',
	})
	.option('--branch <branch>', 'volar branch to use', { default: 'master' })
	.option('--tag <tag>', 'volar tag to use')
	.option('--commit <commit>', 'volar commit sha to use')
	.action(async (suites, options: CommandOptions & { good: string }) => {
		if (!options.good) {
			console.log(
				'you have to specify a known good version with `--good <commit|tag>`',
			)
			process.exit(1)
		}
		const { root, volarPath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let isFirstRun = true
		const { verify } = options
		const runSuite = async () => {
			try {
				await buildVolar({ verify: isFirstRun && verify })
				for (const suite of suitesToRun) {
					await run(suite, {
						verify: !!(isFirstRun && verify),
						skipGit: !isFirstRun,
						root,
						volarPath: volarPath,
						volarMajor: parseVolarMajor(volarPath),
						workspace,
					})
				}
				isFirstRun = false
				return null
			} catch (e) {
				return e
			}
		}
		await setupVolarRepo({ ...options, shallow: false })
		const initialError = await runSuite()
		if (initialError) {
			await bisectVolar(options.good, runSuite)
		} else {
			console.log(`no errors for starting commit, cannot bisect`)
		}
	})
cli.help()
cli.parse()

async function run(suite: string, options: RunOptions) {
	const { test } = await import(`./tests/${suite}.ts`)
	await test({
		...options,
		workspace: path.resolve(options.workspace, suite),
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
			(x) => !x.startsWith('_') && !availableSuites.includes(x),
		)
		if (invalidSuites.length) {
			console.log(`invalid suite(s): ${invalidSuites.join(', ')}`)
			console.log(`available suites: ${availableSuites.join(', ')}`)
			process.exit(1)
		}
	}
	return suitesToRun
}
