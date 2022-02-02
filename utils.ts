import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { execaCommand } from 'execa'
import {
	EnvironmentData,
	Overrides,
	ProcessEnv,
	RepoOptions,
	RunOptions
} from './types'

let vitePath: string
let cwd: string
let env: ProcessEnv

function cd(dir: string) {
	cwd = path.resolve(cwd, dir)
}

async function $(literals: TemplateStringsArray, ...values: any[]) {
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

	if (!fs.existsSync(dir)) {
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

function pnpmCommand(
	task: string | (() => Promise<any>) | void
): (() => Promise<any>) | void {
	return typeof task === 'string' ? async () => $`pnpm ${task}` : task
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
	const { build, test, repo, branch, tag, commit, skipGit, verify, overrides } =
		options
	const buildCommand = pnpmCommand(build)
	const testCommand = pnpmCommand(test)
	const dir = path.resolve(
		options.workspace,
		options.dir || repo.substring(repo.lastIndexOf('/') + 1)
	)

	if (!skipGit) {
		await setupRepo({ repo, dir, branch, tag, commit })
	} else {
		cd(dir)
	}

	if (verify && test) {
		await $`pnpm install --frozen-lockfile --prefer-offline`
		await buildCommand?.()
		await testCommand?.()
	}
	await addLocalPackageOverrides(dir, overrides)
	await $`pnpm install --prefer-frozen-lockfile --prefer-offline`
	await buildCommand?.()
	if (test) {
		await testCommand?.()
	}
	return { dir }
}

export async function setupViteRepo(options: Partial<RepoOptions>) {
	await setupRepo({
		repo: 'vitejs/vite',
		dir: vitePath,
		branch: 'main',
		shallow: true,
		...options
	})
}

export async function buildVite({ verify = false }) {
	cd(vitePath)
	await $`pnpm install --frozen-lockfile`
	await $`pnpm run ci-build-vite`
	await $`pnpm run build-plugin-vue`
	await $`pnpm run build-plugin-react`
	if (verify) {
		await $`pnpm run test-serve -- --runInBand`
		await $`pnpm run test-build -- --runInBand`
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

export async function addLocalPackageOverrides(
	dir: string,
	overrides: Overrides = {}
) {
	if (!overrides.vite) {
		overrides.vite = `${vitePath}/packages/vite`
	}
	await $`git clean -fdxq` // remove current install
	const pkgFile = path.join(dir, 'package.json')
	const pkg = JSON.parse(await fs.promises.readFile(pkgFile, 'utf-8'))
	if (!pkg.pnpm) {
		pkg.pnpm = {}
	}
	pkg.pnpm.overrides = {
		...pkg.pnpm.overrides,
		...overrides
	}
	if (!pkg.devDependencies) {
		pkg.devDependencies = {}
	}
	pkg.devDependencies = {
		...pkg.devDependencies,
		...overrides
	}
	await fs.promises.writeFile(pkgFile, JSON.stringify(pkg, null, 2), 'utf-8')
}

export function dirnameFrom(url: string) {
	return path.dirname(fileURLToPath(url))
}
