#!/bin/sh
set -e
# this script requires git, pnpm and jq to be installed and in path

VITE_REF='main'
VITE_SKIP_VERIFY=0

VITEST_REF='main'
VITEST_SKIP_VERIFY=0
VITEST_SKIP_TEST=0

export NODE_OPTIONS="--max-old-space-size=6144"

WORKSPACE=$PWD

# setup repos
if [ ! -d "vite" ]; then
  git clone git@github.com:vitejs/vite.git vite
fi
if [ ! -d "vitest" ]; then
  git clone git@github.com:vitest-dev/vitest vitest
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

# VITEST
cd ../vitest
git clean -fdxq
git pull origin "$VITEST_REF"
if [ "$VITEST_SKIP_VERIFY" = "0" ]; then
  echo "#### VERIFY VITEST #####"
  pnpm install --frozen-lockfile --prefer-offline
  pnpm build
  pnpm test:run
fi
echo "#### BUILD VITEST WITH LOCAL VITE #####"
git clean -fdxq
mv package.json package.orig.json
jq -r ".devDependencies.vite=\"$WORKSPACE/vite/packages/vite\"|.pnpm.overrides.vite=\"$WORKSPACE/vite/packages/vite\"" package.orig.json > package.json
rm package.orig.json
pnpm install --prefer-frozen-lockfile --prefer-offline
pnpm build
if [ "$VITEST_SKIP_TEST" = "0" ]; then
  echo "#### TEST VITEST WITH LOCAL VITE #####"
  pnpm test:run
fi
