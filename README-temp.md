# temporary commands

## Run against rolldown-vite

```sh
# with pkg.pr.new binaries
pnpm tsx ecosystem-ci.ts vitepress --release https://pkg.pr.new/rolldown/vite@3fc2ac5
# with local builds
pnpm tsx ecosystem-ci.ts vitepress --repo vitejs/rolldown-vite --branch rolldown-vite
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

| suite                                     | state | description                                                                                 |
| ----------------------------------------- | ----: | :------------------------------------------------------------------------------------------ |
| analogjs                                  |    ✅ |                                                                                             |
| [astro](#astro)                           |    ❌ | CJS-ESM interop issue with JSON files, modifies `chunk.modules`, uses `manualChunks`        |
| histoire                                  |    ❌ | uses `preserveModules: true`                                                                |
| ladle                                     |    ✅ |                                                                                             |
| laravel                                   |    ✅ |                                                                                             |
| marko                                     |    ✅ | passed by esbuild-rollup plugin conversion                                                  |
| [nuxt](#nuxt)                             |    ✅ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`                                                |
| previewjs                                 |    ⚠️ | fails locally but when running tests manually in playwright ui, it works. probably fine     |
| quasar                                    |    ✅ |                                                                                             |
| [qwik](#qwik)                             |    ⚠️ | passes, but uses some missing features                                                      |
| rakkas                                    |    ✅ | patched one plugin to return `moduleType: 'js'`                                             |
| react-router                              |    ✅ | better to run with `CI=1` as some tests are flaky and setting that will retry them          |
| storybook                                 |    ✅ |                                                                                             |
| [sveltekit](#sveltekit)                   |    ✅ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`                                                |
| [unocss](#unocss)                         |    ✅ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`                                                |
| [vike](#vike)                             |    ⚠️ | uses advanced `manualChunks`                                                                |
| vite-environment-examples                 |    ✅ |                                                                                             |
| vite-plugin-cloudflare                    |    ✅ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`                                                |
| vite-plugin-pwa                           |    ✅ |                                                                                             |
| vite-plugin-react                         |    ✅ | See https://github.com/rolldown/vite-plugin-react/pull/1                                    |
| vite-plugin-react-swc                     |    ✅ | added `oxc: false` to align with `esbuild: false`                                           |
| [vite-plugin-svelte](#vite-plugin-svelte) |    ⚠️ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`, one test failing but not correctness failures |
| [vite-plugin-vue](#vite-plugin-vue)       |    ⚠️ | 2 tests failing but not correctness failures                                                |
| vite-setup-catalogue                      |    ✅ |                                                                                             |
| vitepress                                 |    ✅ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`                                                |
| vitest                                    |    ✅ | tracking at https://github.com/vitest-dev/vitest/pull/7509                                  |
| vuepress                                  |    ✅ |                                                                                             |
| [waku](#waku)                             |    ✅ | requires `ROLLDOWN_OPTIONS_VALIDATION=loose`                                                |

## Details

### astro

- ❌ `NodeClientAddress`
  - CJS-ESM interop issue with JSON files: [rolldown/rolldown#3640](https://github.com/rolldown/rolldown/issues/3640)
- ⚠️ `CSS production ordering > Page vs. Shared CSS > Page level CSS is defined lower in the page`
  - uses `manualChunks` to reorder the execution order
    - https://github.com/withastro/astro/blob/e5ea5a9c009791b4868f21cff05a9b68e46e639c/packages/astro/src/core/build/plugins/plugin-css.ts#L72-L102
- ⚠ `CSS > dev > remove unused styles from client:load components`
  - uses `manualChunks` to split some styles in a separate chunk?
- ⚠️ `CSS Bundling > using custom assetFileNames config > there are 2 index named CSS files`
  - uses `manualChunks` to set a custom name

### nuxt

- ⚠️ skipped tests for [experimental.decorators](https://nuxt.com/docs/guide/going-further/experimental-features#decorators) feature which requires standard decorators support
  - NOTE: this is NOT the `compilerOptions.experimentalDecorators` in tsconfig, it is an experimental option that enables **standard** decorators support
  - [oxc-project/oxc#9170](https://github.com/oxc-project/oxc/issues/9170)
  - was released in 3.16.0

### qwik

- ⚠️ uses missing features
  - `manualChunks`
    - wants to group chunks by entry ([code](https://github.com/QwikDev/qwik/blob/0a752dc6dd4c7b0000aa6a1d17f3ccfcee89fc7f/packages/qwik/src/optimizer/src/plugins/plugin.ts#L873-L880), introduced in [QwikDev/qwik#6670](https://github.com/QwikDev/qwik/pull/6670), related issue [rollup/rollup#5574](https://github.com/rollup/rollup/issues/5574))
  - `preserveSignature` option in `this.emitFile({ type: 'chunk' })`
    - [rolldown/rolldown#3500](https://github.com/rolldown/rolldown/issues/3500)
- ✅ `pnpm tsx --require ./scripts/runBefore.ts starters/dev-server.ts 3301` hanged
  - added a fix, probably because there was a dead-lock

### sveltekit

better to run with `CI=1` as some tests are flaky and setting that will retry them

- ✅ uses `manualChunks` but can be replaced with `advancedChunks` / `output.inlineDynamicImports` + `experimental.strictExecutionOrder`
  - found some issue with `experimental.strictExecutionOrder` that would be nice to improve: https://github.com/rolldown/rolldown/issues/3410
- ✅ tests in `apps/dev-only`
  - passed by converting esbuild plugins to rollup plugins

### unocss

- ✅ Chunk mode modifies `chunk.modules` to fool the css plugin to generate the css in corresponding chunk ([unocss/unocss#4403](https://github.com/unocss/unocss/issues/4403))
  - but chunk mode is experimental and likely to be removed
  - added a workaround for now

### vike

- uses missing features
  - ⚠️ uses `manualChunks` that requires callbacks
    - https://github.com/vikejs/vike/blob/ea3a84264222768b9869e5f87ce4429e0685f3ae/vike/node/plugin/plugins/distFileNames.ts#L45-L101
    - introduced to workaround [vikejs/vike#1815](https://github.com/vikejs/vike/issues/1815)
    - maybe this can be workaround by adding `?url` to all CSS imports
    - it shouldn't cause a big issue
- ⚠️ `|e2e| test/preload/prod.spec.ts` fails
  - because `manualChunks` is not supported

### vite-plugin-svelte

- ⚠️ `pnpm test:build`
  - `packages/e2e-tests/kit-node/__tests__/kit.spec.ts > kit-node > index route > should not include dynamic import from onmount in ssr output`
    - caused by https://github.com/rolldown/rolldown/issues/3403
- ✅ `pnpm test:serve`
  - passed by converting esbuild plugins to rollup plugins

### vite-plugin-vue

The failing tests are

- ⚠️ `playground/vue-lib/__tests__/vue-lib.spec.ts` > `vue component library > should output tree shakeable css module code`
  - This is happening because OXC minifier does not drop non-used variables
- ✅ `playground/vue-legacy/__tests__/vue-legacy.spec.ts`
  - This is expected as rolldown-vite currently does not support the legacy plugin

### waku

make sure to run with `BROWSER=chromium` if you have a different value set to `BROWSER`

- ⚠️ uses `preserveEntrySignatures: 'exports-only'`
  - [rolldown/rolldown#3500](https://github.com/rolldown/rolldown/issues/3500)
