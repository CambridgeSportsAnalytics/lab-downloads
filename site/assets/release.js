// Fill in the line under the download buttons from the latest GitHub Release:
// version, build date and engine version. The button itself never needs
// this — it links to releases/latest/download/<file>, which GitHub always
// points at the newest build — so if the API is slow or rate-limited the page
// still works and this line just stays empty (and hidden).
(function () {
  const REPO = 'CambridgeSportsAnalytics/lab-downloads';
  const meta = document.querySelector('[data-release]');
  if (!meta) return;

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((release) => {
      const parts = [];
      // Tags look like v0.1.7; show the version and the date.
      const version = (release.tag_name || '').replace(/^v/, '').split('-')[0];
      if (version) parts.push(`Version ${version}`);
      if (release.published_at) {
        const d = new Date(release.published_at);
        parts.push(`Built ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`);
      }
      // The build workflow writes "Engine: rbp-math-lib 1.3.9 (…)" into the notes.
      const engine = /Engine:\s*rbp-math-lib\s+([\d.]+)/.exec(release.body || '');
      if (engine) parts.push(`Engine ${engine[1]}`);

      meta.replaceChildren(...parts.map((p) => {
        const s = document.createElement('span');
        s.textContent = p;
        return s;
      }));
    })
    .catch(() => {});
})();
