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

export async function workInLatest({ repo, folder, ref = 'main' }) {
  if (! fs.existsSync(folder)) {
    await $`git clone ${repo} ${folder}`
  }
  cd(folder)
  await $`git clean -fdxq`
  await $`git pull origin "${ref}"`
}

export async function testInLatest({ repo, folder, task, overrides, ref = 'main', verify = true, test = true }) {
  await workInLatest({ repo, folder, ref })
  if (verify) {
    await $`pnpm install --frozen-lockfile --prefer-offline`
    await task()
  }
  if (test) {
    await overrideVite(overrides)
    await $`pnpm install --prefer-frozen-lockfile --prefer-offline`
    await task()
  }    
}

export async function updateVite({ verify = false } = {}) {
  await workInLatest({ repo: 'git@github.com:vitejs/vite.git', folder: vitePath })
  await $`pnpm install --frozen-lockfile`
    
  await $`pnpm run ci-build-vite`
  await $`pnpm run build-plugin-vue`
  await $`pnpm run build-plugin-react`
        
  if ( verify ) {
    await $`pnpm run test-serve -- --runInBand`
    await $`pnpm run test-build -- --runInBand`
  }
}

export async function overrideVite(overrides) {
  await $`git clean -fdxq`
  await $`mv package.json package.orig.json`
  await $`jq -r ".devDependencies.vite=\\"${vitePath}/packages/vite\\"|.pnpm.overrides.vite=\\"${vitePath}/packages/vite\\"${overrides ? '|' + overrides : ''}" package.orig.json > package.json`
  await $`rm package.orig.json`
}

export function dirnameFrom(url) {
  return path.dirname(fileURLToPath(url))
}