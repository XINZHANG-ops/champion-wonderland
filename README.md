# Champion Wonderland — GitHub Pages frontend

This package is independent of any GitHub account. `site/` contains only public HTML, JavaScript, CSS and logos. No backend code, mail credentials or visitor records are included.

## Publish later using Lucy's account

1. Create a repository in the intended account. Upload this package's **contents**, including `.github/`, to its root. Do not upload a ZIP as a single file.
2. Set `apiBase` in `site/runtime-config.js` to the public HTTPS origin of the **paired backend**, without a trailing slash. The default `backend.example.invalid` is intentionally not connected.
3. Configure the backend's `QUEST_ALLOWED_ORIGINS` to allow the Pages origin, for example `https://lucy.github.io`. A site URL may be `https://lucy.github.io/champion-world/`, but the allowed origin has no repository path.
4. In repository Settings → Pages, choose **GitHub Actions**. The included workflow publishes `site/` on pushes to `main` or a manual run. If the default branch has a different name, update the workflow's `branches` entry.
5. Open the Pages URL. Test joining from two devices, walking, the event screen, and final saving.

No GitHub username is built into the app. Root sites, repository paths and custom domains work. A custom domain must be explicitly allowed by the backend as well.

## Data and limits

- Graphics, questionnaires, recommendations, avatar controls and map gestures run in the browser.
- Multiplayer uses the configured backend. Final responses go to that backend, then through the approved Item Record/Gmail relay to `lkang@desire2learn.com`.
- Do not add keys to `runtime-config.js`; it is public. No third-party cookies are required.
- GitHub hosting does not make the backend trusted by a company. Its network may still need to permit the backend domain.
- Pair this package with its matching backend release. The version check blocks stale writes instead of silently mixing versions.
- This package has not been published. The existing public service is unchanged.

Official workflow reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
