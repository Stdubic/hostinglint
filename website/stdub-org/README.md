# stdub.org — HostingLint documentation page

The file **`hostinglint.html`** is a self-contained page (HTML + CSS) meant to live on [stdub.org](https://stdub.org/) as a separate URL from blog posts.

## Suggested URL

- **Canonical:** `https://stdub.org/hostinglint/`  
  The page includes `<link rel="canonical" href="https://stdub.org/hostinglint/" />`.

## Deploy

1. Upload **`hostinglint.html`** to your static host:
   - As **`/hostinglint/index.html`** (preferred—matches canonical trailing slash), or
   - As **`/hostinglint.html`** (then update the `<link rel="canonical">` in the file if your URL differs).
2. Ensure the server returns **200** for `GET /hostinglint/` if you use a directory index.
3. Optional: add a link from the site home or nav to **HostingLint** → `/hostinglint/`.

No build step is required. Edit the HTML directly if you change npm package names or add CLI flags.

## Repo maintenance

When CLI options or package metadata change, update **`hostinglint.html`** in this repo and re-upload.
