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

| suite                               | state | description                                                                                              |
| ----------------------------------- | ----: | :------------------------------------------------------------------------------------------------------- |
| analogjs                            |    ⏭️ | skipped for now. It is failing with Vite 6 + Node 22.                                                    |
| astro                               |       |                                                                                                          |
| histoire                            |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| ladle                               |    ⏭️ | skipped for now. It is failing with Vite 6 + Node 20.                                                    |
| laravel                             |    ✅ |                                                                                                          |
| marko                               |    ⚠️ | failing due to esbuild plugin usage                                                                      |
| nuxt                                |       |                                                                                                          |
| previewjs                           |       |                                                                                                          |
| quasar                              |       |                                                                                                          |
| qwik                                |       |                                                                                                          |
| rakkas                              |       |                                                                                                          |
| react-router                        |       |                                                                                                          |
| redwoodjs                           |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| remix                               |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| storybook                           |       |                                                                                                          |
| sveltekit                           |       |                                                                                                          |
| unocss                              |       |                                                                                                          |
| vike                                |       |                                                                                                          |
| vite-environment-examples           |       |                                                                                                          |
| vite-plugin-pwa                     |       |                                                                                                          |
| vite-plugin-react                   |    ✅ | I did not ran because it was tested separately. See https://github.com/rolldown/vite-plugin-react/pull/1 |
| vite-plugin-react-swc               |    ⏭️ | skipped for now. It should be fine as vite-plugin-react is tested.                                       |
| vite-plugin-svelte                  |       |                                                                                                          |
| [vite-plugin-vue](#vite-plugin-vue) |    ⚠️ | 2 tests failing but not correctness failures                                                             |
| vite-setup-catalogue                |    ✅ |                                                                                                          |
| [vitepress](#vitepress)             |    ❌ | the test does not run                                                                                    |
| vitest                              |    ⏭️ | skipped for now. It is failing with original main branch.                                                |
| vuepress                            |    ✅ |                                                                                                          |
| waku                                |       |                                                                                                          |

## Details

### marko

- ⚠️ Errors because it tries to update `input` option in `buildStart`
  - Added a patch to update `input` option in `options` hook
  - NOTE: rolldown calls `options` hook for the number of outputOptions + 1 (1 for `bundle.close()`) (which is probably not intuitive)
- ⚠️ An error happens with the optimizer because it uses esbuild plugins: https://github.com/marko-js/vite/blob/ff8a2fe6fdac4848015d39bca4eef82d41743122/src/esbuild-plugin.ts#L15

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
