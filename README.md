# Champion Wonderland — GitHub Pages frontend

`site/` contains public HTML, JavaScript, CSS and logos. No backend secrets or visitor responses are included. The existing questionnaire and world remain available.

## Data routes

- Public nickname, avatar, map area, movement and an unrelated random game session token go to `QUEST_CONFIG.apiBase` for multiplayer.
- Real name, email, organization, job title, interests, questionnaire answers and consent stay in this tab until the visitor explicitly saves. A native browser POST sends them directly to `QUEST_CONFIG.formsEndpoint`, the owner's Google Apps Script receiver. The script saves to the owner's Google Form.
- No questionnaire relay, SMTP or Gmail route exists in this frontend. The final button says Saved only after Google's matching positive receipt. A timeout remains a retryable error with the same submission ID.
- The questionnaire record ID is not sent to the multiplayer backend. Public nicknames are independently chosen; don't put private contact details in a nickname.

## Publishing

1. The owner must first update the existing Apps Script deployment with the supplied `Code.txt`, allowing `https://lucy-kang1022.github.io`. Update the **existing deployment** to a new version; keep the same `/exec` address. Do not run setup again.
2. Deploy the matching game-only backend and configure its exact `QUEST_ALLOWED_ORIGINS`. The frontend and backend use the same release version.
3. Copy this package's contents, including `.github/`, into the frontend repository and push. The existing GitHub Actions workflow publishes `site/`.
4. Test two browsers and one clearly labelled synthetic completed Form response. Verify the response appears in the owner's Form and never in game requests or storage.

Both runtime addresses are public configuration, not passwords. GitHub Pages alone does not change the trust status of the game backend. The game server necessarily receives connection IPs and can observe public gameplay. The Google account's ownership, retention and company approval remain the owner's responsibility. Google availability, quotas and commit time apply; this build does not promise an instant save or send an email notification.

## Updating Lucy's published frontend

This repository shares history with `lucy-kang1022/champion-wonderland`. Only the public frontend is tracked. The Pages workflow deploys from Lucy's repository; it skips in this source repository.

From the existing Lucy repository in PowerShell, run once:

```powershell
git remote add upstream https://github.com/XINZHANG-ops/champion-wonderland.git
```

For each update, with a clean working tree:

```powershell
git pull --ff-only upstream main
git push origin main
```

Do not use force push or discard local changes. If Git reports divergence or local changes, stop and inspect. The existing Pages URL stays the same. The current release targets the public game-only API and Lucy's direct Google receiver. Never add backend credentials or visitor responses here.
