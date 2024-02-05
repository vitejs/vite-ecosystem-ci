import fs from 'fs'
import path from 'path'
import process from 'process'
import { cac } from 'cac'

import {
	setupEnvironment,
	setupSvelteRepo,
	buildSvelte,
	bisectSvelte,
	parseSvelteMajor,
	parseMajorVersion,
} from './utils.ts'
import type { CommandOptions, RunOptions } from './types.d.ts'

const cli = cac()
cli
	.command('[...suites]', 'build svelte and run selected suites')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--repo <repo>', 'svelte repository to use', {
		default: 'sveltejs/svelte',
	})
	.option('--branch <branch>', 'svelte branch to use', { default: 'svelte-4' })
	.option('--tag <tag>', 'svelte tag to use')
	.option('--commit <commit>', 'svelte commit sha to use')
	.option('--release <version>', 'svelte release to use from npm registry')
	.action(async (suites, options: CommandOptions) => {
		const { root, sveltePath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let svelteMajor
		if (!options.release) {
			await setupSvelteRepo(options)
			await buildSvelte({ verify: options.verify })
			svelteMajor = parseSvelteMajor(sveltePath)
		} else {
			svelteMajor = parseMajorVersion(options.release)
		}
		const runOptions: RunOptions = {
			root,
			sveltePath,
			svelteMajor,
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
	.command('build-svelte', 'build svelte only')
	.option('--verify', 'verify svelte checkout by running tests', {
		default: false,
	})
	.option('--repo <repo>', 'svelte repository to use', {
		default: 'sveltejs/svelte',
	})
	.option('--branch <branch>', 'svelte branch to use', { default: 'main' })
	.option('--tag <tag>', 'svelte tag to use')
	.option('--commit <commit>', 'svelte commit sha to use')
	.action(async (options: CommandOptions) => {
		await setupEnvironment()
		await setupSvelteRepo(options)
		await buildSvelte({ verify: options.verify })
	})

cli
	.command('run-suites [...suites]', 'run single suite with pre-built svelte')
	.option(
		'--verify',
		'verify checkout by running tests before using local svelte',
		{ default: false },
	)
	.option('--repo <repo>', 'svelte repository to use', {
		default: 'sveltejs/svelte',
	})
	.option('--release <version>', 'svelte release to use from npm registry')
	.action(async (suites, options: CommandOptions) => {
		const { root, sveltePath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		const runOptions: RunOptions = {
			...options,
			root,
			sveltePath,
			svelteMajor: parseSvelteMajor(sveltePath),
			workspace,
		}
		for (const suite of suitesToRun) {
			await run(suite, runOptions)
		}
	})

cli
	.command(
		'bisect [...suites]',
		'use git bisect to find a commit in svelte that broke suites',
	)
	.option('--good <ref>', 'last known good ref, e.g. a previous tag. REQUIRED!')
	.option('--verify', 'verify checkouts by running tests', { default: false })
	.option('--repo <repo>', 'svelte repository to use', {
		default: 'sveltejs/svelte',
	})
	.option('--branch <branch>', 'svelte branch to use', { default: 'master' })
	.option('--tag <tag>', 'svelte tag to use')
	.option('--commit <commit>', 'svelte commit sha to use')
	.action(async (suites, options: CommandOptions & { good: string }) => {
		if (!options.good) {
			console.log(
				'you have to specify a known good version with `--good <commit|tag>`',
			)
			process.exit(1)
		}
		const { root, sveltePath, workspace } = await setupEnvironment()
		const suitesToRun = getSuitesToRun(suites, root)
		let isFirstRun = true
		const { verify } = options
		const runSuite = async () => {
			try {
				await buildSvelte({ verify: isFirstRun && verify })
				for (const suite of suitesToRun) {
					await run(suite, {
						verify: !!(isFirstRun && verify),
						skipGit: !isFirstRun,
						root,
						sveltePath,
						svelteMajor: parseSvelteMajor(sveltePath),
						workspace,
					})
				}
				isFirstRun = false
				return null
			} catch (e) {
				return e
			}
		}
		await setupSvelteRepo({ ...options, shallow: false })
		const initialError = await runSuite()
		if (initialError) {
			await bisectSvelte(options.good, runSuite)
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
