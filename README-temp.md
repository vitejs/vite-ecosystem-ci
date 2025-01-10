# temporary commands

## Run against rolldown-vite

```sh
# with pkg.pr.new binaries
pnpm tsx ecosystem-ci.ts vitepress --release https://pkg.pr.new/rolldown/vite@2814e17
# with local builds
pnpm tsx ecosystem-ci.ts vitepress --repo rolldown/vite --branch rolldown-v6
```

## Create patches to bypass errors

These commands are written in sh.

```sh
# run it before editing
tests-patches/pre-create-patch vite-plugin-vue/vite-plugin-vue
# run it after editing
tests-patches/create-patch vite-plugin-vue/vite-plugin-vue
# not need to run, but you can run this to check the applied state
tests-patches/apply-patch vite-plugin-vue/vite-plugin-vue
```

The created patches will be applied automatically when running `pnpm tsx ecosystem-ci.ts`

# Current status

## Summary

| suite                                     | state | description                                                                                              |
| ----------------------------------------- | ----: | :------------------------------------------------------------------------------------------------------- |
| [analogjs](#analog)                       |    ❌ | rolldown crashes at `core/src/slice/sort/shared/smallsort.rs`                                            |
| astro                                     |       |                                                                                                          |
| histoire                                  |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| ladle                                     |    ✅ |                                                                                                          |
| laravel                                   |    ✅ |                                                                                                          |
| marko                                     |    ⚠️ | failing due to esbuild plugin usage                                                                      |
| nuxt                                      |       |                                                                                                          |
| previewjs                                 |       |                                                                                                          |
| quasar                                    |    ✅ |                                                                                                          |
| qwik                                      |       |                                                                                                          |
| rakkas                                    |    ✅ | patched one plugin to return `moduleType: 'js'`                                                          |
| react-router                              |       |                                                                                                          |
| redwoodjs                                 |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| remix                                     |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| storybook                                 |       |                                                                                                          |
| sveltekit                                 |       |                                                                                                          |
| unocss                                    |       |                                                                                                          |
| vike                                      |       |                                                                                                          |
| vite-environment-examples                 |       |                                                                                                          |
| vite-plugin-pwa                           |    ✅ | patched one place that was assigning to OutputBundle                                                     |
| vite-plugin-react                         |    ✅ | I did not ran because it was tested separately. See https://github.com/rolldown/vite-plugin-react/pull/1 |
| vite-plugin-react-swc                     |    ⏭️ | skipped for now. It should be fine as vite-plugin-react is tested.                                       |
| [vite-plugin-svelte](#vite-plugin-svelte) |    ❌ | some tests fail                                                                                          |
| [vite-plugin-vue](#vite-plugin-vue)       |    ⚠️ | 2 tests failing but not correctness failures                                                             |
| vite-setup-catalogue                      |    ✅ |                                                                                                          |
| [vitepress](#vitepress)                   |    ❌ | the test does not run                                                                                    |
| vitest                                    |    ⏭️ | skipped for now. It is failing with original main branch.                                                |
| vuepress                                  |    ✅ |                                                                                                          |
| waku                                      |       |                                                                                                          |

## Details

### analog

`nx run blog-app:build:production` crashes with

```
thread 'tokio-runtime-worker' panicked at core/src/slice/sort/shared/smallsort.rs:865:5:
user-provided comparison function does not correctly implement a total order
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

Steps to reproduce:

1. clone this branch
2. Run `pnpm install`
3. Run `pnpm tsx ecosystem-ci.ts analogjs --repo rolldown/vite --branch rolldown-v6`
4. After that you can run `pnpm nx run blog-app:build:production` in `workspace/analogjs/analog` to only run that build

### marko

- ⚠️ Errors because it tries to update `input` option in `buildStart`
  - Added a patch to update `input` option in `options` hook
  - NOTE: rolldown calls `options` hook for the number of outputOptions + 1 (1 for `bundle.close()`) (which is probably not intuitive)
- ⚠️ An error happens with the optimizer because it uses esbuild plugins: https://github.com/marko-js/vite/blob/ff8a2fe6fdac4848015d39bca4eef82d41743122/src/esbuild-plugin.ts#L15

### vite-plugin-svelte

- `pnpm test:build`
  - `packages/e2e-tests/ts-type-import/__tests__/ts-type-import.spec.ts`
    - probably needs https://github.com/oxc-project/oxc/commit/2e7207f11ca986584d334c36632481786b82645a to be released in rolldown.
  - `packages/e2e-tests/kit-node/__tests__/kit.spec.ts > kit-node > index route > should not include dynamic import from onmount in ssr output`
    - TODO: need to investigate
- `pnpm test:serve`
  - many tests fail because it uses esbuild plugins: https://github.com/sveltejs/vite-plugin-svelte/blob/f8ec65d452905db8c6c096e0671d230f4f2a0d97/packages/vite-plugin-svelte/src/utils/options.js#L387-L397

### vite-plugin-vue

The failing tests are

- ⚠️ `playground/vue-lib/__tests__/vue-lib.spec.ts` > `vue component library > should output tree shakeable css module code`
  - This is happening because OXC minifier does not drop non-used variables
- ✅ `playground/vue-legacy/__tests__/vue-legacy.spec.ts`
  - This is expected as rolldown-vite currently does not support the legacy plugin

### vitepress

Failed with

> RollupError: Parse failure: Expected ',', got 'Ref'
> 2 | import { onMounted, onUnmounted, onUpdated, type Ref } from "vue"
> | ^

probably needs https://github.com/oxc-project/oxc/commit/2e7207f11ca986584d334c36632481786b82645a to be released in rolldown.

# Note to self

- [ ] There's many "OXC-esbuild incompatible options" warning output by Vite should be deduped
