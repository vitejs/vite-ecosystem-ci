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
	const proc = execaCommand(cmd, {
		env,
		stdio: "pipe",
		cwd
	})
	process.stdin.pipe(proc.stdin)
	proc.stdout.pipe(process.stdout)
	proc.stderr.pipe(process.stderr)
	const result = await proc
	return result.stdout
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

export async function setupRepo({repo, dir, branch = 'main', tag, commit, shallow = true}) {
	if (!repo.includes(':')) {
		repo = `https://github.com/${repo}.git`
	}

	if (!fs.existsSync(dir)) {
		await $`git -c advice.detachedHead=false clone ${shallow ? '--depth=1 --no-tags' : ''} --branch ${tag || branch} ${repo} ${dir}`
	}
	cd(dir)
	await $`git clean -fdxq`
	await $`git fetch ${shallow ? '--depth=1 --no-tags' : '--tags'} origin ${tag ? `tag ${tag}` : `${commit || branch}`}`
	if (shallow) {
		await $`git -c advice.detachedHead=false checkout ${tag ? `tags/${tag}` : `${commit || branch}`}`
	} else {
		await $`git checkout ${branch}`
		await $`git merge FETCH_HEAD`
		if (tag || commit) {
			await $`git reset --hard ${tag || commit}`
		}
	}
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
		verify = true,
		skipGit = false
	}) {
	build = pnpmCommand(build)
	test = pnpmCommand(test)

	if (!folder) {
		// Use the repository name as the folder, omit possible org name
		folder = repo.substring(repo.lastIndexOf('/') + 1)
	}
	const dir = path.resolve(workspace, folder)
	if (!skipGit) {
		await setupRepo({repo, dir, branch, tag, commit})
	} else {
		cd(dir)
	}

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

export async function setupViteRepo({branch = 'main', tag, commit, shallow = true} = {}) {
	await setupRepo({repo: 'vitejs/vite', dir: vitePath, branch, tag, commit, shallow})
}

export async function buildVite({verify = false}) {
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

export async function bisectVite({good, runSuite}) {
	try {
		cd(vitePath)
		await $`git bisect start`
		await $`git bisect bad`
		await $`git bisect good ${good}`
		let bisecting = true
		while (bisecting) {
			const commitMsg = await $`git log -1 --format=%s`
			const isNonCodeCommit = commitMsg.match(/^(?:release|docs)[:(]/)
			if(isNonCodeCommit){
				await $`git bisect skip`
				continue // see if next commit can be skipped too
			}
			const error = await runSuite()
			const bisectOut = await $`git bisect ${error ? 'bad' : 'good'}`
			bisecting = bisectOut.substring(0, 10).toLowerCase() === 'bisecting:' // as long as git prints 'bisecting: ' there are more revisions to test
		}
	} catch(e) {
		console.log('error while bisecting',e);
	} finally {
		try {
			await $`git bisect reset`
		} catch (e) {
			console.log('Error while resetting bisect', e)
		}
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
