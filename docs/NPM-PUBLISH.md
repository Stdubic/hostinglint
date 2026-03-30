# Publishing HostingLint to npm

Both **`@hostinglint/core`** and **`hostinglint`** are public packages. Verify with:

```bash
npm view @hostinglint/core version
npm view hostinglint version
```

## First-time setup

1. Create an account: https://www.npmjs.com/signup  
2. Enable **two-factor authentication** on npm (required for publishing in many cases).  
3. Log in locally:

   ```bash
   npm login
   ```

4. If you see cache permission errors (`EPERM` under `~/.npm`), fix ownership (macOS/Linux):

   ```bash
   sudo chown -R "$(id -u)":"$(id -g)" ~/.npm
   ```

   Or use a dedicated cache for one session:

   ```bash
   export NPM_CONFIG_CACHE="$PWD/.npm-cache"
   mkdir -p "$NPM_CONFIG_CACHE"
   ```

## Publish a new version (maintainers)

1. Bump versions in **`packages/core/package.json`** and **`packages/cli/package.json`** (CLI depends on matching `@hostinglint/core` version).  
2. Build and test from repo root:

   ```bash
   npm run validate
   ```

3. Publish **core** first (scoped package must be public):

   ```bash
   cd packages/core
   npm publish --access public
   ```

4. Publish **CLI**:

   ```bash
   cd ../cli
   npm publish
   ```

If npm returns **403** mentioning 2FA, use an interactive login (`npm login`) or a **granular access token** with publish permission and “bypass 2FA” for automation, as per npm’s docs.

## Dry-run (packaging check)

Use a clean cache directory if needed:

```bash
export NPM_CONFIG_CACHE=/tmp/npm-cache-hostinglint
mkdir -p "$NPM_CONFIG_CACHE"
cd packages/core && npm publish --dry-run
```
