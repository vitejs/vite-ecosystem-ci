import { $, cd } from 'zx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';

export let root
export let vitePath
export let workspace

export async function setup() {
  await $`set -e`
  await $`export NODE_OPTIONS="--max-old-space-size=6144"`
  process.env.CI=true
  root = dirnameFrom(import.meta.url)
  workspace = path.resolve(root, 'workspace')
  vitePath = path.resolve(workspace, 'vite')
  return { root, workspace, vitePath }
}

export async function setupRepo({ repo, dir, ref = 'main' }) {
  if (! fs.existsSync(dir)) {
    await $`git clone ${repo} ${dir}`
  }
  cd(dir)
  await $`git clean -fdxq`
  await $`git pull origin "${ref}"`
}

function pnpmCommand(task) {
  return typeof task === 'string' ? async() => $`pnpm ${task}` : task
}

export async function runInRepo({ repo, workspace, folder, build, test, overrides, ref = 'main', verify = true }) {
  build = pnpmCommand(build)
  test = pnpmCommand(test)
  if( !repo.includes(':') ) {
    repo = `git@github.com:${repo}.git`
  }
  if( !folder ) {
    // Use the repository name as the folder
    folder = repo.split('/')[1].slice(0,-4)
  }
  const dir = path.resolve(workspace, folder)
  await setupRepo({ repo, dir, ref })
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
  return { dir }
}

export async function setupVite({ verify = false } = {}) {
  await setupRepo({ repo: 'git@github.com:vitejs/vite.git', dir: vitePath })
  await $`pnpm install --frozen-lockfile`
  await $`pnpm run ci-build-vite`
  await $`pnpm run build-plugin-vue`
  await $`pnpm run build-plugin-react`
  if ( verify ) {
    await $`pnpm run test-serve -- --runInBand`
    await $`pnpm run test-build -- --runInBand`
  }
}

export async function addLocalPackageOverrides(dir, overrides = {}) {
  overrides.vite = `${vitePath}/packages/vite`
  await $`git clean -fdxq` // remove current install
  const pkgFile = path.join(dir,'package.json');
  const pkg = JSON.parse(await fs.promises.readFile(pkgFile,'utf-8'))
  if(!pkg.pnpm) {
    pkg.pnpm = {}
  }
  pkg.pnpm.overrides = {
    ...pkg.pnpm.overrides,
    ...overrides
  }
  if(!pkg.devDependencies) {
    pkg.devDependencies = {}
  }
  pkg.devDependencies = {
    ...pkg.devDependencies,
    ...overrides
  }
  await fs.promises.writeFile(pkgFile,JSON.stringify(pkg,null,2),'utf-8')
}

export function dirnameFrom(url) {
  return path.dirname(fileURLToPath(url))
}
