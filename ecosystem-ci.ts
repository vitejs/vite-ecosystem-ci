import fs from 'fs'
import path from 'path'
import process from 'process'
import { cac } from 'cac'

import {
	setupEnvironment,
	setupNxRepo,
	buildNx,
	bisectNx,
	parseNxMajor,
	parseMajorVersion,
} from './utils'
import { CommandOptions, RunOptions } from './types'

const cli = cac()
cli
	.command('[...suites]', 'build nx and run selected suites')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--repo <repo>', 'nx repository to use', { default: 'nrwl/nx' })
	.option('--branch <branch>', 'nx branch to use', { default: 'master' })
	.option('--tag <tag>', 'nx tag to use')
	.option('--commit <commit>', 'nx commit sha to use')
	.option('--release <version>', 'nx release to use from npm registry')
	.action(async (suites, options: CommandOptions) => {
		const { root, nxPath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let nxMajor
		if (!options.release) {
			await setupNxRepo(options)
			await buildNx({ verify: options.verify })
			nxMajor = parseNxMajor(nxPath)
		} else {
			nxMajor = parseMajorVersion(options.release)
		}
		const runOptions: RunOptions = {
			root,
			nxPath,
			nxMajor,
			workspace,
			release: options.release,
			verify: options.verify,
			skipGit: false,
		}
		const failed = []
		const passed = []
		for (const suite of suitesToRun) {
			try {
				await run(suite, runOptions)
				passed.push(suite)
			} catch (e) {
				failed.push(suite)
			}
		}

		console.log(`
Ecosystem tests ran.
Summary:
${passed.length} passed
${failed.length} failed

Successfull tests:
${passed.join('\n')}

Failed tests:
${failed.join('\n')}
		`)
	})

cli
	.command('build-nx', 'build nx only')
	.option('--verify', 'verify nx checkout by running tests', {
		default: false,
	})
	.option('--repo <repo>', 'nx repository to use', { default: 'nrwl/nx' })
	.option('--branch <branch>', 'nx branch to use', { default: 'master' })
	.option('--tag <tag>', 'nx tag to use')
	.option('--commit <commit>', 'nx commit sha to use')
	.action(async (options: CommandOptions) => {
		await setupEnvironment()
		await setupNxRepo(options)
		await buildNx({ verify: options.verify })
	})

cli
	.command('run-suites [...suites]', 'run single suite with pre-built nx')
	.option(
		'--verify',
		'verify checkout by running tests before using local nx',
		{ default: false },
	)
	.option('--repo <repo>', 'nx repository to use', { default: 'nrwl/nx' })
	.option('--release <version>', 'nx release to use from npm registry')
	.action(async (suites, options: CommandOptions) => {
		const { root, nxPath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		const runOptions: RunOptions = {
			...options,
			root,
			nxPath,
			nxMajor: parseNxMajor(nxPath),
			workspace,
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command(
		'bisect [...suites]',
		'use git bisect to find a commit in nx that broke suites',
	)
	.option('--good <ref>', 'last known good ref, e.g. a previous tag. REQUIRED!')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--repo <repo>', 'nx repository to use', { default: 'nrwl/nx' })
	.option('--branch <branch>', 'nx branch to use', { default: 'master' })
	.option('--tag <tag>', 'nx tag to use')
	.option('--commit <commit>', 'nx commit sha to use')
	.action(async (suites, options: CommandOptions & { good: string }) => {
		if (!options.good) {
			console.log(
				'you have to specify a known good version with `--good <commit|tag>`',
			)
			process.exit(1)
		}
		const { root, nxPath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let isFirstRun = true
		const { verify } = options
		const runSuite = async () => {
			try {
				await buildNx({ verify: isFirstRun && verify })
				for (const suite of suitesToRun) {
					await run(suite, {
						verify: !!(isFirstRun && verify),
						skipGit: !isFirstRun,
						root,
						nxPath,
						nxMajor: parseNxMajor(nxPath),
						workspace,
					})
				}
				isFirstRun = false
				return null
			} catch (e) {
				return e
			}
		}
		await setupNxRepo({ ...options, shallow: false })
		const initialError = await runSuite()
		if (initialError) {
			await bisectNx(options.good, runSuite)
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
