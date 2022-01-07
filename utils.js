import { $, cd } from 'zx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';

export let root
export let vitePath

export async function setup() {
  await $`set -e`
  await $`export NODE_OPTIONS="--max-old-space-size=6144"`
  root = dirnameFrom(import.meta.url)
  vitePath = path.resolve(root, './vite')
}

export async function setupRepo({ repo, folder, ref = 'main' }) {
  if (! fs.existsSync(folder)) {
    await $`git clone ${repo} ${folder}`
  }
  cd(folder)
  await $`git clean -fdxq`
  await $`git pull origin "${ref}"`
}

export async function runInRepo({ repo, folder, buildTask, testTask, overrides, ref = 'main', verify = true, test = true }) {
  await setupRepo({ repo, folder, ref })
  if (verify && testTask) {
    await $`pnpm install --frozen-lockfile --prefer-offline`
    await buildTask()
    await testTask()
  }
  await addLocalPackageOverrides(folder, overrides)
  await $`pnpm install --prefer-frozen-lockfile --prefer-offline`
  await buildTask()
  if(test && testTask) {
    await testTask()
  }
}

export async function setupVite({ verify = false } = {}) {
  await setupRepo({ repo: 'git@github.com:vitejs/vite.git', folder: vitePath })
  await $`pnpm install --frozen-lockfile`
  await $`pnpm run ci-build-vite`
  await $`pnpm run build-plugin-vue`
  await $`pnpm run build-plugin-react`
  if ( verify ) {
    await $`pnpm run test-serve -- --runInBand`
    await $`pnpm run test-build -- --runInBand`
  }
}

export async function addLocalPackageOverrides(folder, overrides = {}) {
  overrides.vite = `${vitePath}/packages/vite`
  await $`git clean -fdxq` // remove current install
  const pkgFile = path.join(folder,'package.json');
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
