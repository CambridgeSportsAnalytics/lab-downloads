# Lab downloads

The public download pages for Lab, and the workflow that builds what they serve.

| Page | Brand | File |
| --- | --- | --- |
| `/csa/` | CSA Prediction Lab · Cambridge Sports Analytics | `CSA-Prediction-Lab.dmg` |
| `/cha/` | CHA Prediction Lab · Cambridge Health Analytics | `CHA-Prediction-Lab.dmg` |

The bare address redirects to `/csa/`. Each brand has its own page so a health
customer never lands on the sports brand.

## How a release happens

1. **Actions → Build Lab → Run workflow.**
2. It checks out `prediction-lab` at `main` (private), sets `rbp-math-lib` to
   the engine you chose, and runs Lab's tests. A failing test stops the release.
3. It builds both brands as universal (Apple Silicon + Intel) apps on a macOS
   runner, stamps them with the version, and publishes a GitHub Release. The
   release notes say which Lab commit and engine went in.
4. The download buttons link to `releases/latest/download/<file>`, so the new
   build is live the moment the release exists. Nothing in `site/` changes.
5. Installed copies read `latest-csa.json` or `latest-cha.json` from the same
   place on launch, and offer to restart into the new version.

### The inputs, all optional

| Input | Blank means | Otherwise |
| --- | --- | --- |
| *lab_ref* | `main` | any prediction-lab branch, tag or commit |
| *engine_ref* | the highest `vX.Y.Z` tag of rbp-math-lib | any engine tag (`v1.3.6`), branch or commit (`ff4b4ba`) |
| *version* | `<major>.<minor>` from Lab's `tauri.conf.json` + the run number, e.g. `0.1.7` | exactly this version, e.g. `1.0.0` |

A version must be higher than every earlier release, because installed copies
only update to a higher one; the workflow refuses anything else before it
builds. If the default would come out lower (say after you released `1.0.0` by
hand), it uses the highest release plus one in the last place instead, and
says so. Raise the version in `tauri.conf.json` to move the default on.

A release from a branch of Lab, or from an untagged engine commit, is still
the latest release, and every installed copy will be offered it.

Each release holds, per brand: the `.dmg` people download, the signed
`.app.tar.gz` installed copies update from, and the `latest-<brand>.json`
feed pointing at it.

The source code stays private; only the built DMGs are public.

## One-time setup

- **Secret `LAB_REPO_TOKEN`:** a fine-grained personal access token with
  read-only *Contents* access to `prediction-lab` and `rbp-math-lib`.
- **Secret `TAURI_SIGNING_PRIVATE_KEY`:** the updater's private key. Its public
  half is `plugins.updater.pubkey` in prediction-lab's `tauri.conf.json`, and
  installed copies refuse any update not signed with it. Keep a backup
  somewhere other than GitHub (a password manager): if the key is lost,
  installed copies can never be updated again and everyone has to reinstall
  by hand.
- **Pages:** Settings → Pages → Source: *GitHub Actions*. `site/` is published
  by `.github/workflows/pages.yml` on every push that touches it.
- **Custom domain (optional):** add it under Settings → Pages and point a CNAME
  record at `cambridgesportsanalytics.github.io`.

## Signing (later)

Builds are currently unsigned, so the pages tell people how to get past
Gatekeeper the first time. When there is an Apple Developer ID:

1. Add the six `APPLE_*` secrets listed at the top of
   `.github/workflows/build.yml`. The workflow notices them and signs and
   notarizes; no change to the workflow is needed.
2. Delete the "Open it the first time" step (marked `UNSIGNED`) from
   `site/csa/index.html` and `site/cha/index.html`.
