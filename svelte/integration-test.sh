#!/bin/sh
set -e
# this script requires git, pnpm and jq to be installed and in path

VITE_REF='main'
VITE_SKIP_VERIFY=0

VITE_PLUGIN_SVELTE_REF='main'
VITE_PLUGIN_SVELTE_SKIP_VERIFY=0
VITE_PLUGIN_SVELTE_SKIP_TEST=0

KIT_REF='master'
KIT_SKIP_VERIFY=0

export NODE_OPTIONS="--max-old-space-size=6144"

WORKSPACE=$PWD

# setup repos
if [ ! -d "vite" ]; then
  git clone git@github.com:vitejs/vite.git vite
fi
if [ ! -d "vite-plugin-svelte" ]; then
  git clone git@github.com:sveltejs/vite-plugin-svelte.git vite-plugin-svelte
fi
if [ ! -d "kit" ]; then
  git clone git@github.com:sveltejs/kit.git kit
fi

# VITE
cd vite
git clean -fdxq
git pull origin "$VITE_REF"
pnpm install --frozen-lockfile
pnpm run ci-build-vite
if [ "$VITE_SKIP_VERIFY" = "0" ]; then
  echo "#### VERIFY VITE #####"
  pnpm run build-plugin-vue
  pnpm run build-plugin-react
  pnpm run test-serve -- --runInBand
  pnpm run test-build -- --runInBand
fi

# VITE-PLUGIN-SVELTE
cd ../vite-plugin-svelte
git clean -fdxq
git pull origin "$VITE_PLUGIN_SVELTE_REF"
if [ "$VITE_PLUGIN_SVELTE_SKIP_VERIFY" = "0" ]; then
  echo "#### VERIFY VITE-PLUGIN-SVELTE #####"
  pnpm install --frozen-lockfile --prefer-offline
  pnpm build:ci
  pnpm test:ci
fi
echo "#### BUILD VITE-PLUGIN-SVELTE WITH LOCAL VITE #####"
git clean -fdxq
mv package.json package.orig.json
jq -r ".devDependencies.vite=\"$WORKSPACE/vite/packages/vite\"|.pnpm.overrides.vite=\"$WORKSPACE/vite/packages/vite\"" package.orig.json > package.json
rm package.orig.json
pnpm install --prefer-frozen-lockfile --prefer-offline
pnpm build:ci
if [ "$VITE_PLUGIN_SVELTE_SKIP_TEST" = "0" ]; then
  echo "#### TEST VITE-PLUGIN-SVELTE WITH LOCAL VITE #####"
  pnpm test:ci
fi

# SVELTEKIT
cd ../kit
git clean -fdxq
git pull origin "$KIT_REF"
if [ "$KIT_SKIP_VERIFY" = "0" ]; then
  echo "#### VERIFY KIT #####"
  pnpm install --frozen-lockfile --prefer-offline
  pnpm build --filter ./packages --filter !./packages/create-svelte/templates
  pnpm test
fi
echo "#### BUILD AND TEST KIT WITH LOCAL VITE-PLUGIN-SVELTE AND VITE #####"
git clean -fdxq
mv package.json package.orig.json
jq -r ".devDependencies.vite=\"$WORKSPACE/vite/packages/vite\"|.pnpm.overrides.vite=\"$WORKSPACE/vite/packages/vite\"|.devDependencies.\"@sveltejs/vite-plugin-svelte\"=\"$WORKSPACE/vite-plugin-svelte/packages/vite-plugin-svelte\"|.pnpm.overrides.\"@sveltejs/vite-plugin-svelte\"=\"$WORKSPACE/vite-plugin-svelte/packages/vite-plugin-svelte\"" package.orig.json > package.json
rm package.orig.json
pnpm install --prefer-frozen-lockfile --prefer-offline
pnpm build --filter ./packages --filter !./packages/create-svelte/templates
pnpm test
cd ..

