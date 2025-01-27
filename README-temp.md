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

| suite                                                   | state | description                                                                                              |
| ------------------------------------------------------- | ----: | :------------------------------------------------------------------------------------------------------- |
| [analogjs](#analog)                                     |    ❌ | failing due to incorrect chunk generation                                                                |
| [astro](#astro)                                         |    ❌ | rolldown crashes at `core/src/slice/sort/shared/smallsort.rs`                                            |
| histoire                                                |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| ladle                                                   |    ✅ |                                                                                                          |
| laravel                                                 |    ✅ | needs `VITE_USE_LEGACY_PARSE_AST=1`                                                                      |
| [marko](#marko)                                         |    ✅ | passed by esbuild-rollup plugin conversion                                                               |
| [nuxt](#nuxt)                                           |    ❌ | fails due to chunk name conflict and incorrect minification                                              |
| previewjs                                               |    ⚠️ | fails locally but when running tests manually in playwright ui, it works. probably fine                  |
| quasar                                                  |    ✅ | needs `VITE_USE_LEGACY_PARSE_AST=1`                                                                      |
| [qwik](#qwik)                                           |    ❌ | uses `this.emitFile({ type: 'chunk' })`, `manualChunks`                                                  |
| rakkas                                                  |    ✅ | patched one plugin to return `moduleType: 'js'`                                                          |
| [react-router](#react-router)                           |    ❌ | one test failing due to incorrect JSX transformation                                                     |
| redwoodjs                                               |    ⏭️ | skipped for now. It is failing with Vite 6.                                                              |
| [storybook](#storybook)                                 |    ❌ | one test failing due to incorrect JSX transformation                                                     |
| [sveltekit](#sveltekit)                                 |    ⚠️ | mostly works, only one minor issue                                                                       |
| [unocss](#unocss)                                       |    ❌ | modifies `chunk.modules`. needs `VITE_USE_LEGACY_PARSE_AST=1`                                            |
| [vike](#vike)                                           |    ❌ | uses `writeBundle.sequential`, advanced `manualChunks`                                                   |
| [vite-environment-examples](#vite-environment-examples) |    ❌ | needs more investigation                                                                                 |
| vite-plugin-pwa                                         |    ✅ | patched one place that was assigning to OutputBundle                                                     |
| vite-plugin-react                                       |    ✅ | I did not ran because it was tested separately. See https://github.com/rolldown/vite-plugin-react/pull/1 |
| vite-plugin-react-swc                                   |    ⏭️ | skipped for now. It should be fine as vite-plugin-react is tested.                                       |
| [vite-plugin-svelte](#vite-plugin-svelte)               |    ⚠️ | one test failing but not correctness failures                                                            |
| [vite-plugin-vue](#vite-plugin-vue)                     |    ⚠️ | 2 tests failing but not correctness failures                                                             |
| vite-setup-catalogue                                    |    ✅ |                                                                                                          |
| vitepress                                               |    ✅ | patched one place that was assigning to OutputBundle                                                     |
| vitest                                                  |    ⏭️ | skipped for now. It is failing with original main branch.                                                |
| vuepress                                                |    ✅ | needs `VITE_USE_LEGACY_PARSE_AST=1`                                                                      |
| [waku](#waku)                                           |    ❌ | rolldown crashes at `core/src/slice/sort/shared/smallsort.rs`. needs `VITE_USE_LEGACY_PARSE_AST=1`       |

## Details

### analog

- ❌ `nx run blog-app:build:production` errors
  - It's because rolldown is generating an invalid chunk: [rolldown/rolldown#3438](https://github.com/rolldown/rolldown/issues/3438)

### astro

[WIP]

- ❌ uses missing features
  - uses `meta.chunks` in `renderChunk` hook, also does `delete chunk.modules[id]`
    - https://github.com/withastro/astro/blob/46ec06ed82887eaf1fe3a73158407b496669c5f0/packages/astro/src/core/build/plugins/plugin-css.ts#L172-L175
- ❌ `i18n routing does not break assets and endpoints > assets`, `astro:assets > build ssg`, `Astro.session` crashes with
  ```
  thread 'tokio-runtime-worker' panicked at core/src/slice/sort/shared/smallsort.rs:865:5:
  user-provided comparison function does not correctly implement a total order
  note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
  ```

Steps to reproduce:

1. clone this branch
2. Run `pnpm install`
3. Run `pnpm tsx ecosystem-ci.ts astro --repo rolldown/vite --branch rolldown-v6`
4. After that you can run `node ./test/actions.test.js` in `workspace/astro/astro/packages/astro` to only run that build

### marko

- ⚠️ Errors because it tries to update `input` option in `buildStart`
  - Added a patch to update `input` option in `options` hook
- ✅ passed by converting esbuild plugins to rollup plugins

### nuxt

`pnpm test:fixtures:dev` and `pnpm test:types` passes.

- ❌ `ECOSYSTEM_CI=1 pnpm test:fixtures` fails
  - ❌ caused by chunk name conflict
    - See [rolldown/rolldown#3443](https://github.com/rolldown/rolldown/issues/3443) for more details.
    - Added a patch
  - ❌ caused by assigning to `bundle[chunkName].isEntry` in `generateBundle` hook
    - https://github.com/nuxt/nuxt/blob/f90ed0ff67c8ec3e284baed44c8e27e4171941ed/packages/nuxt/src/components/plugins/islands-transform.ts#L222-L223
    - I guess it's to change the behavior of the manifest plugin in Vite core
    - Sent a PR: [rolldown/rolldown#3446](https://github.com/rolldown/rolldown/pull/3446)
  - ❌ incorrect minification: [oxc-project/oxc#8759](https://github.com/oxc-project/oxc/pull/8759)
  - ⚠️ uses function type `outputOptions.assetFileNames` in `generateBundle` hook
    - it can be workaround by using `this.environment.config.build.rollupOptions.output.assetFileNames` (applied this workaround)

### qwik

- ❌ uses missing features
  - `this.emitFile({ type: 'chunk' })` (should be supported by https://github.com/rolldown/rolldown/pull/3351, try it later after upgraded rolldown)
  - `manualChunks`
  - `closeBundle.sequential` (https://github.com/rolldown/rolldown/issues/3337)
  - `preserveSignature` option in `this.emitFile({ type: 'chunk' })`

### react-router

better to run with `CI=1` as some tests are flaky and setting that will retry them

- ❌ `client-data-test.ts:768:5 › Client Data › clientLoader - critical route module › bubbled server loader errors are persisted for hydrating routes` fails
  - OXC tranforms JSX in development mode incorrectly (https://github.com/oxc-project/oxc/issues/8650)
- ⚠️ `fog-of-war-test.ts:1152:3 › Fog of War › skips prefetching if the URL gets too large`
  - OXC aligns with babel, but esbuild transforms differently (https://github.com/oxc-project/oxc/issues/8690)
  - added a patch

### storybook

`yarn task --task test-runner --template react-vite/default-ts --start-from=build` passes.

- ❌ `yarn task --task test-runner-dev --template react-vite/default-ts --start-from=dev` fails
  - OXC tranforms JSX in development mode incorrectly (https://github.com/oxc-project/oxc/issues/8650)

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
  - ⚠️ uses `writeBundle.sequential` (https://github.com/rolldown/rolldown/issues/3337)
  - ❌ uses function `assetFileNames` option (+ `this.emitFile` in Vite) blocked by https://github.com/rolldown/rolldown/issues/3414
  - ❌ uses `manualChunks` that requires callbacks
    - https://github.com/vikejs/vike/blob/ea3a84264222768b9869e5f87ce4429e0685f3ae/vike/node/plugin/plugins/distFileNames.ts#L45-L101
- ❌ `|e2e| test/assertFileEnv/test-build.spec.ts` fails
  - because of https://github.com/rolldown/rolldown/issues/3402
  - added a patch
- ❌ `|e2e| test/preload/prod.spec.ts` fails
  - because function `assetFileNames` is not supported and `manualChunks` is not supported

### vite-environment-examples

needs `VITE_USE_LEGACY_PARSE_AST=1`

- ⚠️ `pnpm -C examples/web-worker build` fails because rolldown does not support non-asset `this.emitFile`
- ❌ `pnpm -C examples/react-server build` fails with `Error: Could not resolve "/dist/react-server/assets/_client-Qeq15YSF.css" in virtual:copy-server-css.js`
  - It seems the css file is removed when the second `await builder.build(builder.environments["rsc"]!);` is called.
  - TODO: need to investigate further

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

needs `VITE_USE_LEGACY_PARSE_AST=1`

- ❌ `pnpm build` in `waku/e2e/fixtures/broken-links` crashes with
  ```
  thread 'tokio-runtime-worker' panicked at core/src/slice/sort/shared/smallsort.rs:865:5:
  user-provided comparison function does not correctly implement a total order
  note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
  ```
- ⚠️ uses `preserveEntrySignatures: 'exports-only'`

# Note to self

- [ ] There's many "OXC-esbuild incompatible options" warning output by Vite should be deduped
- [ ] Add a friendly error message when `@babel/runtime` is not installed (`Could not resolve "@babel/runtime/helpers/classPrivateFieldSet2" in entrypoint` at https://github.com/rolldown/vite/blob/5cdceeb16fc7d660efa5024307b33f458532d204/packages/vite/src/node/plugins/oxc.ts#L514-L538)
