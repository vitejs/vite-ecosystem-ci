import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { execaCommand } from 'execa'
import {
	EnvironmentData,
	Overrides,
	ProcessEnv,
	RepoOptions,
	RunOptions,
	Task,
} from './types'
//eslint-disable-next-line n/no-unpublished-import
import { detect, AGENTS, Agent, getCommand } from '@antfu/ni'
import actionsCore from '@actions/core'
// eslint-disable-next-line n/no-unpublished-import
import * as semver from 'semver'
import fetch from 'node-fetch'

const isGitHubActions = !!process.env.GITHUB_ACTIONS

const nxCliCommands = ['create-nx-plugin', 'create-nx-workspace', 'nx']

let cwd: string
let env: ProcessEnv

function cd(dir: string) {
	cwd = path.resolve(cwd, dir)
}

export async function $(literals: TemplateStringsArray, ...values: any[]) {
	const cmd = literals.reduce(
		(result, current, i) =>
			result + current + (values?.[i] != null ? `${values[i]}` : ''),
		'',
	)

	if (isGitHubActions) {
		actionsCore.startGroup(`${cwd} $> ${cmd}`)
	} else {
		console.log(`${cwd} $> ${cmd}`)
	}

	const proc = execaCommand(cmd, {
		env: { ...env, NODE_ENV: 'development' },
		stdio: 'pipe',
		cwd,
	})
	proc.stdin && process.stdin.pipe(proc.stdin)
	proc.stdout && proc.stdout.pipe(process.stdout)
	proc.stderr && proc.stderr.pipe(process.stderr)
	const result = await proc

	if (isGitHubActions) {
		actionsCore.endGroup()
	}

	return result.stdout
}

export async function setupEnvironment(): Promise<EnvironmentData> {
	// @ts-expect-error import.meta
	const root = dirnameFrom(import.meta.url)
	const workspace = path.resolve(root, 'workspace')
	cwd = process.cwd()
	env = {
		...process.env,
		CI: 'true',
		YARN_ENABLE_IMMUTABLE_INSTALLS: 'false', // to avoid errors with mutated lockfile due to overrides
		NODE_OPTIONS: '--max-old-space-size=6144', // GITHUB CI has 7GB max, stay below
		ECOSYSTEM_CI: 'true', // flag for tests, can be used to conditionally skip irrelevant tests.
	}
	initWorkspace(workspace)
	return { root, workspace, cwd, env }
}

function initWorkspace(workspace: string) {
	if (!fs.existsSync(workspace)) {
		fs.mkdirSync(workspace, { recursive: true })
	}
	const eslintrc = path.join(workspace, '.eslintrc.json')
	if (!fs.existsSync(eslintrc)) {
		fs.writeFileSync(eslintrc, '{"root":true}\n', 'utf-8')
	}
	const editorconfig = path.join(workspace, '.editorconfig')
	if (!fs.existsSync(editorconfig)) {
		fs.writeFileSync(editorconfig, 'root = true\n', 'utf-8')
	}
}

export async function setupRepo(options: RepoOptions) {
	if (options.branch == null) {
		options.branch = 'main'
	}
	if (options.shallow == null) {
		options.shallow = true
	}

	let { repo, commit, branch, tag, dir, shallow } = options
	if (!dir) {
		throw new Error('setupRepo must be called with options.dir')
	}
	if (!repo.includes(':')) {
		repo = `https://github.com/${repo}.git`
	}

	let needClone = true
	if (fs.existsSync(dir)) {
		const _cwd = cwd
		cd(dir)
		let currentClonedRepo: string | undefined
		try {
			currentClonedRepo = await $`git ls-remote --get-url`
		} catch {
			// when not a git repo
		}
		cd(_cwd)

		if (repo === currentClonedRepo) {
			needClone = false
		} else {
			fs.rmSync(dir, { recursive: true, force: true })
		}
	}

	if (needClone) {
		await $`git -c advice.detachedHead=false clone ${
			shallow ? '--depth=1 --no-tags' : ''
		} --branch ${tag || branch} ${repo} ${dir}`
	}
	cd(dir)
	await $`git clean -fdxq`
	await $`git fetch ${shallow ? '--depth=1 --no-tags' : '--tags'} origin ${
		tag ? `tag ${tag}` : `${commit || branch}`
	}`
	if (shallow) {
		await $`git -c advice.detachedHead=false checkout ${
			tag ? `tags/${tag}` : `${commit || branch}`
		}`
	} else {
		await $`git checkout ${branch}`
		await $`git merge FETCH_HEAD`
		if (tag || commit) {
			await $`git reset --hard ${tag || commit}`
		}
	}
}

function toCommand(
	task: Task | Task[] | void,
	agent: Agent,
): ((scripts: any) => Promise<any>) | void {
	return async (scripts: any) => {
		const tasks = Array.isArray(task) ? task : [task]
		for (const task of tasks) {
			if (task == null || task === '') {
				continue
			} else if (typeof task === 'string') {
				const scriptOrBin = task.trim().split(/\s+/)[0]
				if (scripts?.[scriptOrBin] != null) {
					const runTaskWithAgent = getCommand(agent, 'run', [task])
					await $`${runTaskWithAgent}`
				} else {
					await $`${task}`
				}
			} else if (typeof task === 'function') {
				await task()
			} else {
				throw new Error(
					`invalid task, expected string or function but got ${typeof task}: ${task}`,
				)
			}
		}
	}
}

export async function runInRepo(options: RunOptions & RepoOptions) {
	if (options.verify == null) {
		options.verify = true
	}
	if (options.skipGit == null) {
		options.skipGit = false
	}
	if (options.branch == null) {
		options.branch = 'main'
	}

	const {
		build,
		test,
		e2e,
		repo,
		branch,
		tag,
		commit,
		skipGit,
		verify,
		beforeInstall,
		beforeBuild,
		beforeTest,
	} = options

	const dir = path.resolve(
		options.workspace,
		options.dir || repo.substring(repo.lastIndexOf('/') + 1),
	)

	if (!skipGit) {
		await setupRepo({ repo, dir, branch, tag, commit })
	} else {
		cd(dir)
	}
	if (options.agent == null) {
		const detectedAgent = await detect({ cwd: dir, autoInstall: false })
		if (detectedAgent == null) {
			throw new Error(`Failed to detect packagemanager in ${dir}`)
		}
		options.agent = detectedAgent
	}
	if (!AGENTS[options.agent]) {
		throw new Error(
			`Invalid agent ${options.agent}. Allowed values: ${Object.keys(
				AGENTS,
			).join(', ')}`,
		)
	}
	const agent = options.agent
	const beforeInstallCommand = toCommand(beforeInstall, agent)
	const beforeBuildCommand = toCommand(beforeBuild, agent)
	const beforeTestCommand = toCommand(beforeTest, agent)
	const buildCommand = toCommand(build, agent)
	const testCommand = toCommand(test, agent)
	const e2eCommand = toCommand(e2e, agent)

	const pkgFile = path.join(dir, 'package.json')
	const pkg = JSON.parse(await fs.promises.readFile(pkgFile, 'utf-8'))

	await beforeInstallCommand?.(pkg.scripts)

	const frozenInstall = getCommand(agent, 'frozen')
	await $`${frozenInstall}`
	if (verify && test) {
		await beforeBuildCommand?.(pkg.scripts)
		await buildCommand?.(pkg.scripts)
		await beforeTestCommand?.(pkg.scripts)
		await testCommand?.(pkg.scripts)
		// await e2eCommand?.(pkg.scripts)
	}

	const pm = agent?.split('@')[0]
	await $`${pm} nx migrate next`
	const justInstall = getCommand(agent, 'install')
	await $`${justInstall}`
	await $`${pm} nx migrate --run-migrations --no-interactive`

	await beforeBuildCommand?.(pkg.scripts)
	await buildCommand?.(pkg.scripts)
	if (test) {
		await beforeTestCommand?.(pkg.scripts)
		await testCommand?.(pkg.scripts)
	}

	await e2eCommand?.(pkg.scripts)

	return { dir }
}

/**
 * utility to override packageManager version
 *
 * @param pkg parsed package.json
 * @param pm package manager to override eg. `pnpm`
 * @returns {boolean} true if pkg was updated, caller is responsible for writing it to disk
 */
async function overridePackageManagerVersion(
	pkg: { [key: string]: any },
	pm: string,
): Promise<boolean> {
	const versionInUse = pkg.packageManager?.startsWith(`${pm}@`)
		? pkg.packageManager.substring(pm.length + 1)
		: await $`${pm} --version`
	let overrideWithVersion: string | null = null
	if (pm === 'pnpm') {
		if (semver.eq(versionInUse, '7.18.0')) {
			// avoid bug with absolute overrides in pnpm 7.18.0
			overrideWithVersion = '7.18.1'
		}
	}
	if (overrideWithVersion) {
		console.warn(
			`detected ${pm}@${versionInUse} used in ${pkg.name}, changing pkg.packageManager and pkg.engines.${pm} to enforce use of ${pm}@${overrideWithVersion}`,
		)
		// corepack reads this and uses pnpm @ newVersion then
		pkg.packageManager = `${pm}@${overrideWithVersion}`
		if (!pkg.engines) {
			pkg.engines = {}
		}
		pkg.engines[pm] = overrideWithVersion

		if (pkg.devDependencies?.[pm]) {
			// if for some reason the pm is in devDependencies, that would be a local version that'd be preferred over our forced global
			// so ensure it here too.
			pkg.devDependencies[pm] = overrideWithVersion
		}

		return true
	}
	return false
}

async function getOverrides(
	optionsOverrides: Overrides,
	nxPackages: string[],
): Promise<Overrides> {
	const overrides = optionsOverrides || {}

	for (const pkg of nxPackages) {
		overrides[pkg] ||= await nextVersion(pkg)
	}

	return overrides
}

function getNxDependencies(pkg: any): string[] {
	const dependencies = Object.keys(pkg['dependencies'] || {}).filter((dep) =>
		dep.startsWith('@nx'),
	)
	const devDependencies = Object.keys(pkg['devDependencies'] || {}).filter(
		(dep) => dep.startsWith('@nx'),
	)

	return [...(dependencies ?? []), ...(devDependencies ?? []), ...nxCliCommands]
}

export async function applyPackageOverridesAndInstall(
	dir: string,
	pkg: any,
	overrides: Overrides = {},
) {
	// remove boolean flags
	overrides = Object.fromEntries(
		Object.entries(overrides)
			//eslint-disable-next-line @typescript-eslint/no-unused-vars
			.filter(([_key, value]) => typeof value === 'string')
			.map(([key, value]) => [key, value]),
	)

	await $`git clean -fdxq` // remove current install

	const agent = await detect({ cwd: dir, autoInstall: false })
	if (!agent) {
		throw new Error(`failed to detect packageManager in ${dir}`)
	}
	// Remove version from agent string:
	// yarn@berry => yarn
	// pnpm@6, pnpm@7 => pnpm
	const pm = agent?.split('@')[0]

	await overridePackageManagerVersion(pkg, pm)

	if (pm === 'pnpm' || pm === 'yarn' || pm === 'npm') {
		for (const [name, version] of Object.entries(overrides)) {
			if (pkg.dependencies?.[name]) {
				pkg.dependencies[name] = version
			}
			if (pkg.devDependencies?.[name]) {
				pkg.devDependencies[name] = version
			}
		}
	} else {
		throw new Error(`unsupported package manager detected: ${pm}`)
	}
	const pkgFile = path.join(dir, 'package.json')
	await fs.promises.writeFile(pkgFile, JSON.stringify(pkg, null, 2), 'utf-8')

	// use of `ni` command here could cause lockfile violation errors so fall back to native commands that avoid these
	if (pm === 'pnpm') {
		await $`pnpm install --prefer-frozen-lockfile --prefer-offline --strict-peer-dependencies false`
	} else if (pm === 'yarn') {
		await $`yarn install`
	} else if (pm === 'npm') {
		await $`npm install`
	}
}

export async function getInstallCommand(dir: string): Promise<string> {
	const agent = await detect({ cwd: dir, autoInstall: false })
	if (!agent) {
		throw new Error(`failed to detect packageManager in ${dir}`)
	}
	// Remove version from agent string:
	// yarn@berry => yarn
	// pnpm@6, pnpm@7 => pnpm
	const pm = agent?.split('@')[0]
	if (pm === 'pnpm') {
		return `pnpm install --prefer-frozen-lockfile --prefer-offline --strict-peer-dependencies false`
	} else if (pm === 'yarn') {
		return `yarn install`
	} else if (pm === 'npm') {
		return `npm install`
	} else {
		throw new Error(`unsupported package manager detected: ${pm}`)
	}
}

export async function nxMigrateNext() {
	await $`nx migrate next`
}

export function dirnameFrom(url: string) {
	return path.dirname(fileURLToPath(url))
}

async function nextVersion(packageName: string): Promise<string> {
	return fetch(`https://registry.npmjs.org/${packageName}`)
		.then((response) => response.json())
		.then(
			(jsonData) =>
				(jsonData as any)?.['dist-tags']?.['next'] ??
				(jsonData as any)?.['dist-tags']?.['latest'],
		)
}
