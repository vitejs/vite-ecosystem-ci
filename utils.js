import path from 'path'
import fs from 'fs'
import {fileURLToPath} from 'url';
import {execaCommand} from 'execa';

export let root
export let vitePath
export let workspace
export let cwd
export let env

function cd(dir) {
	cwd = path.resolve(cwd, dir);
}

async function $(literals, ...values) {
	const cmd = literals.reduce((result, current, i) => result + current + (values?.[i] != null ? `${values[i]}` : ''), '')
	console.log(`${cwd} $> ${cmd}`)
	return execaCommand(cmd, {
		env,
		stdio: "inherit",
		cwd
	})
}

export async function setup() {
	root = dirnameFrom(import.meta.url)
	workspace = path.resolve(root, 'workspace')
	vitePath = path.resolve(workspace, 'vite')
	cwd = process.cwd()
	env = {
		...process.env,
		CI: true,
		NODE_OPTIONS: '--max-old-space-size=6144', // GITHUB CI has 7GB max, stay below
	}
	return {root, workspace, vitePath, cwd, env}
}

export async function setupRepo({repo, dir, branch = 'main', tag, commit}) {
	if (!repo.includes(':')) {
		repo = `https://github.com/${repo}.git`
	}

	if (!fs.existsSync(dir)) {
		await $`git clone --depth=1 --no-tags --branch ${tag || branch} ${repo} ${dir}`
	}
	cd(dir)
	await $`git clean -fdxq`
	await $`git fetch --depth 1 --no-tags origin ${tag ? `tag ${tag}` : `${commit || branch}`}`
	await $`git -c advice.detachedHead=false checkout ${tag ? `tags/${tag}` : `${commit || branch}`}`
}

function pnpmCommand(task) {
	return typeof task === 'string' ? async () => $`pnpm ${task}` : task
}

export async function runInRepo({
		repo,
		workspace,
		folder,
		build,
		test,
		overrides,
		branch = 'main',
		tag,
		commit,
		verify = true
	}) {
	build = pnpmCommand(build)
	test = pnpmCommand(test)

	if (!folder) {
		// Use the repository name as the folder, omit possible org name
		folder = repo.substring(repo.lastIndexOf('/') + 1)
	}
	const dir = path.resolve(workspace, folder)
	await setupRepo({repo, dir, branch, tag, commit})
	if (verify && test) {
		await $`pnpm install --frozen-lockfile --prefer-offline`
		await build()
		await test()
	}
	await addLocalPackageOverrides(dir, overrides)
	await $`pnpm install --prefer-frozen-lockfile --prefer-offline`
	await build()
	if (test) {
		await test()
	}
	return {dir}
}

export async function setupVite({verify = false, branch = 'main', tag, commit} = {}) {
	await setupRepo({repo: 'vitejs/vite', dir: vitePath, branch, tag, commit})
	await $`pnpm install --frozen-lockfile`
	await $`pnpm run ci-build-vite`
	await $`pnpm run build-plugin-vue`
	await $`pnpm run build-plugin-react`
	if (verify) {
		await $`pnpm run test-serve -- --runInBand`
		await $`pnpm run test-build -- --runInBand`
	}
}

export async function addLocalPackageOverrides(dir, overrides = {}) {
	overrides.vite = `${vitePath}/packages/vite`
	await $`git clean -fdxq` // remove current install
	const pkgFile = path.join(dir, 'package.json');
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

export function dirnameFrom(url) {
	return path.dirname(fileURLToPath(url))
}
