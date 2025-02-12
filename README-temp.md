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
| analogjs                                  |    ✅ |                                                                                                          |
| [astro](#astro)                           |    👀 | need to investigate further                                                                              |
| histoire                                  |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| ladle                                     |    ✅ |                                                                                                          |
| laravel                                   |    ✅ |                                                                                                          |
| [marko](#marko)                           |    ✅ | passed by esbuild-rollup plugin conversion                                                               |
| [nuxt](#nuxt)                             |    ✅ | uses function type `outputOptions.assetFileNames` in `generateBundle` hook but can be worked around      |
| previewjs                                 |    ⚠️ | fails locally but when running tests manually in playwright ui, it works. probably fine                  |
| quasar                                    |    ✅ |                                                                                                          |
| [qwik](#qwik)                             |    ⚠️ | passes, but uses some missing features                                                                   |
| rakkas                                    |    ✅ | patched one plugin to return `moduleType: 'js'`                                                          |
| react-router                              |    ✅ | better to run with `CI=1` as some tests are flaky and setting that will retry them                       |
| redwoodjs                                 |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| storybook                                 |    ✅ |                                                                                                          |
| [sveltekit](#sveltekit)                   |    ⚠️ | mostly works, only one minor issue                                                                       |
| [unocss](#unocss)                         |    ❌ | modifies `chunk.modules`.                                                                                |
| [vike](#vike)                             |    ❌ | uses advanced `manualChunks`                                                                             |
| vite-environment-examples                 |    ✅ |                                                                                                          |
| vite-plugin-pwa                           |    ✅ | patched one place that was assigning to OutputBundle                                                     |
| vite-plugin-react                         |    ✅ | I did not ran because it was tested separately. See https://github.com/rolldown/vite-plugin-react/pull/1 |
| vite-plugin-react-swc                     |    ⏭️ | skipped for now. It should be fine as vite-plugin-react is tested.                                       |
| [vite-plugin-svelte](#vite-plugin-svelte) |    ⚠️ | one test failing but not correctness failures                                                            |
| [vite-plugin-vue](#vite-plugin-vue)       |    ⚠️ | 2 tests failing but not correctness failures                                                             |
| vite-setup-catalogue                      |    ✅ |                                                                                                          |
| vitepress                                 |    ✅ | patched one place that was assigning to OutputBundle                                                     |
| vitest                                    |    👀 | will check                                                                                               |
| vuepress                                  |    ✅ |                                                                                                          |
| [waku](#waku)                             |    ✅ | needs `VITE_USE_LEGACY_PARSE_AST=1`                                                                      |

## Details

### astro

[WIP]

- ❌ uses missing features
  - uses `meta.chunks` in `renderChunk` hook, also does `delete chunk.modules[id]`
    - https://github.com/withastro/astro/blob/46ec06ed82887eaf1fe3a73158407b496669c5f0/packages/astro/src/core/build/plugins/plugin-css.ts#L172-L175
- ❌ many tests failing
  - TODO: need to investigate further

### marko

- ⚠️ Errors because it tries to update `input` option in `buildStart`
  - Added a patch to update `input` option in `options` hook
- ✅ passed by converting esbuild plugins to rollup plugins

### nuxt

- ⚠️ uses function type `outputOptions.assetFileNames` in `generateBundle` hook
  - it can be workaround by using `this.environment.config.build.rollupOptions.output.assetFileNames` (applied this workaround)
  - [rolldown/rolldown#3445](https://github.com/rolldown/rolldown/issues/3445)

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

- ⚠️ uses `manualChunks` but can be replaced with `advancedChunks`
  - Note that the test expects a single chunk to be output, but rolldown outputs 5 chunks (probably because it'll break the execution order), ~~I guess this is fine~~ maybe not (https://github.com/sveltejs/kit/issues/3882), it seems they want to make sure there's a single chunk
  - Also found some issue with `experimental.strictExecutionOrder`: https://github.com/rolldown/rolldown/issues/3410
- ✅ tests in `apps/dev-only`
  - passed by converting esbuild plugins to rollup plugins

### unocss

- ❌ `test/fixtures.test.ts > fixtures > vite client`/`test/fixtures.test.ts > fixtures > vite lib`/`test/fixtures.test.ts > fixtures > vite lib rollupOptions` fails
  - UnoCSS modifies `chunk.modules` to fool the css plugin to generate the css in corresponding chunk ([unocss/unocss#4403](https://github.com/unocss/unocss/issues/4403))

### vike

- uses missing features
  - ❌ uses `manualChunks` that requires callbacks
    - https://github.com/vikejs/vike/blob/ea3a84264222768b9869e5f87ce4429e0685f3ae/vike/node/plugin/plugins/distFileNames.ts#L45-L101
    - introduced to workaround [vikejs/vike#1815](https://github.com/vikejs/vike/issues/1815)
    - maybe this can be workaround by adding `?url` to all CSS imports
- ❌ `|e2e| test/preload/prod.spec.ts` fails
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

needs `VITE_USE_LEGACY_PARSE_AST=1` (waiting for https://github.com/oxc-project/oxc/pull/8983, released in OXC 0.50.0)

make sure to run with `BROWSER=chromium` if you have a different value set to `BROWSER`

- ⚠️ uses `preserveEntrySignatures: 'exports-only'`
  - [rolldown/rolldown#3500](https://github.com/rolldown/rolldown/issues/3500)
