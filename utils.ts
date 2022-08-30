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
	Task
} from './types'
//eslint-disable-next-line node/no-unpublished-import
import { detect } from '@antfu/ni'

let vitePath: string
let cwd: string
let env: ProcessEnv

function cd(dir: string) {
	cwd = path.resolve(cwd, dir)
}

export async function $(literals: TemplateStringsArray, ...values: any[]) {
	const cmd = literals.reduce(
		(result, current, i) =>
			result + current + (values?.[i] != null ? `${values[i]}` : ''),
		''
	)
	console.log(`${cwd} $> ${cmd}`)
	const proc = execaCommand(cmd, {
		env,
		stdio: 'pipe',
		cwd
	})
	proc.stdin && process.stdin.pipe(proc.stdin)
	proc.stdout && proc.stdout.pipe(process.stdout)
	proc.stderr && proc.stderr.pipe(process.stderr)
	const result = await proc
	return result.stdout
}

export async function setupEnvironment(): Promise<EnvironmentData> {
	// @ts-expect-error import.meta
	const root = dirnameFrom(import.meta.url)
	const workspace = path.resolve(root, 'workspace')
	vitePath = path.resolve(workspace, 'vite')
	cwd = process.cwd()
	env = {
		...process.env,
		CI: 'true',
		YARN_ENABLE_IMMUTABLE_INSTALLS: 'false', // to avoid errors with mutated lockfile due to overrides
		NODE_OPTIONS: '--max-old-space-size=6144' // GITHUB CI has 7GB max, stay below
	}
	return { root, workspace, vitePath, cwd, env }
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
	task: Task | Task[] | void
): ((scripts: any) => Promise<any>) | void {
	return async (scripts: any) => {
		const tasks = Array.isArray(task) ? task : [task]
		for (const task of tasks) {
			if (task == null || task === '') {
				continue
			} else if (typeof task === 'string') {
				const scriptOrBin = task.trim().split(/\s+/)[0]
				await (scripts?.[scriptOrBin] != null ? $`nr ${task}` : $`${task}`)
			} else if (typeof task === 'function') {
				await task()
			} else {
				throw new Error(
					`invalid task, expected string or function but got ${typeof task}: ${task}`
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
		repo,
		branch,
		tag,
		commit,
		skipGit,
		verify,
		beforeInstall,
		beforeBuild,
		beforeTest,
		useCopyForOverrides
	} = options
	const beforeInstallCommand = toCommand(beforeInstall)
	const beforeBuildCommand = toCommand(beforeBuild)
	const beforeTestCommand = toCommand(beforeTest)
	const buildCommand = toCommand(build)
	const testCommand = toCommand(test)
	const dir = path.resolve(
		options.workspace,
		options.dir || repo.substring(repo.lastIndexOf('/') + 1)
	)

	if (!skipGit) {
		await setupRepo({ repo, dir, branch, tag, commit })
	} else {
		cd(dir)
	}

	const pkgFile = path.join(dir, 'package.json')
	const pkg = JSON.parse(await fs.promises.readFile(pkgFile, 'utf-8'))

	await beforeInstallCommand?.(pkg.scripts)

	if (verify && test) {
		await $`ni --frozen`
		await beforeBuildCommand?.(pkg.scripts)
		await buildCommand?.(pkg.scripts)
		await beforeTestCommand?.(pkg.scripts)
		await testCommand?.(pkg.scripts)
	}
	const overrides = options.overrides || {}
	if (options.release) {
		if (overrides.vite && overrides.vite !== options.release) {
			throw new Error(
				`conflicting overrides.vite=${overrides.vite} and --release=${options.release} config. Use either one or the other`
			)
		} else {
			overrides.vite = options.release
		}
	} else {
		const protocol = useCopyForOverrides ? 'file:' : ''

		overrides.vite ||= `${protocol}${options.vitePath}/packages/vite`
		overrides[
			`@vitejs/plugin-vue`
		] ||= `${protocol}${options.vitePath}/packages/plugin-vue`
		overrides[
			`@vitejs/plugin-vue-jsx`
		] ||= `${protocol}${options.vitePath}/packages/plugin-vue-jsx`
		overrides[
			`@vitejs/plugin-react`
		] ||= `${protocol}${options.vitePath}/packages/plugin-react`
		overrides[
			`@vitejs/plugin-legacy`
		] ||= `${protocol}${options.vitePath}/packages/plugin-legacy`
		const typesNodePath = fs.realpathSync(
			`${options.vitePath}/node_modules/@types/node`
		)
		overrides[`@types/node`] ||= `${protocol}${typesNodePath}`
	}
	await applyPackageOverrides(dir, pkg, overrides)
	await beforeBuildCommand?.(pkg.scripts)
	await buildCommand?.(pkg.scripts)
	if (test) {
		await beforeTestCommand?.(pkg.scripts)
		await testCommand?.(pkg.scripts)
	}
	return { dir }
}

export async function setupViteRepo(options: Partial<RepoOptions>) {
	await setupRepo({
		repo: options.repo || 'vitejs/vite',
		dir: vitePath,
		branch: 'main',
		shallow: true,
		...options
	})

	try {
		const rootPackageJsonFile = path.join(vitePath, 'package.json')
		const rootPackageJson = JSON.parse(
			await fs.promises.readFile(rootPackageJsonFile, 'utf-8')
		)
		if (rootPackageJson.name !== 'vite-monorepo') {
			throw new Error('name does not match')
		}
	} catch (e) {
		throw new Error(`Non-vite repository was cloned by setupViteRepo. (${e})`)
	}
}

export async function getPermanentRef() {
	cd(vitePath)
	try {
		const ref = await $`git log -1 --pretty=format:%h`
		return ref
	} catch (e) {
		console.warn(`Failed to obtain perm ref. ${e}`)
		return undefined
	}
}

export async function buildVite({ verify = false }) {
	cd(vitePath)
	await $`ni --frozen`
	await $`nr build`
	if (verify) {
		await $`nr test`
	}
}

export async function bisectVite(
	good: string,
	runSuite: () => Promise<Error | void>
) {
	try {
		cd(vitePath)
		await $`git bisect start`
		await $`git bisect bad`
		await $`git bisect good ${good}`
		let bisecting = true
		while (bisecting) {
			const commitMsg = await $`git log -1 --format=%s`
			const isNonCodeCommit = commitMsg.match(/^(?:release|docs)[:(]/)
			if (isNonCodeCommit) {
				await $`git bisect skip`
				continue // see if next commit can be skipped too
			}
			const error = await runSuite()
			cd(vitePath)
			const bisectOut = await $`git bisect ${error ? 'bad' : 'good'}`
			bisecting = bisectOut.substring(0, 10).toLowerCase() === 'bisecting:' // as long as git prints 'bisecting: ' there are more revisions to test
		}
	} catch (e) {
		console.log('error while bisecting', e)
	} finally {
		try {
			cd(vitePath)
			await $`git bisect reset`
		} catch (e) {
			console.log('Error while resetting bisect', e)
		}
	}
}

export async function applyPackageOverrides(
	dir: string,
	pkg: any,
	overrides: Overrides = {}
) {
	await $`git clean -fdxq` // remove current install

	const agent = await detect({ cwd: dir, autoInstall: false })

	// Remove version from agent string:
	// yarn@berry => yarn
	// pnpm@6, pnpm@7 => pnpm
	const pm = agent?.split('@')[0]

	if (pm === 'pnpm') {
		if (!pkg.devDependencies) {
			pkg.devDependencies = {}
		}
		pkg.devDependencies = {
			...pkg.devDependencies,
			...overrides // overrides must be present in devDependencies or dependencies otherwise they may not work
		}
		if (!pkg.pnpm) {
			pkg.pnpm = {}
		}
		pkg.pnpm.overrides = {
			...pkg.pnpm.overrides,
			...overrides
		}
	} else if (pm === 'yarn') {
		pkg.resolutions = {
			...pkg.resolutions,
			...overrides
		}
	} else if (pm === 'npm') {
		pkg.overrides = {
			...pkg.overrides,
			...overrides
		}
		// npm does not allow overriding direct dependencies, force it by updating the blocks themselves
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

export function dirnameFrom(url: string) {
	return path.dirname(fileURLToPath(url))
}
