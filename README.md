# Champion Wonderland — GitHub Pages frontend

`site/` contains public HTML, JavaScript, CSS and logos. No backend secrets or visitor responses are included. The existing questionnaire and world remain available.

## Data routes

- Public nickname, avatar, map area, movement and an unrelated random game session token go to `QUEST_CONFIG.apiBase` for multiplayer.
- Real name, email, organization, job title, interests, questionnaire answers and consent stay in this tab until the visitor explicitly saves. A native browser POST sends them directly to `QUEST_CONFIG.formsEndpoint`, the owner's Google Apps Script receiver. The script saves to the owner's Google Form.
- No questionnaire relay, SMTP or Gmail route exists in this frontend. The final button says Saved only after Google's matching positive receipt. A timeout remains a retryable error with the same submission ID.
- The questionnaire record ID is not sent to the multiplayer backend. Public nicknames are independently chosen; don't put private contact details in a nickname.

## Returning to the world

The same browser remembers only the public nickname, moose appearance, area and zoom. Refreshing or reopening the page returns directly to the world. Start over clears these settings. Contact details and questionnaire answers remain outside this cache; private unfinished answers still live only in the current tab. No hardware fingerprint or persistent game bearer token is collected. A new page creates a fresh game visit using the remembered public settings, so the previous page's exit cannot remove the new visit. The exact old walking coordinate is not restored.

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


## Personalized Ignite Canada Moose cards

The approved five fixed background templates, official D2L logo and Champions QR are included. Moose configuration, name, selected missions, topics and formats are personalized locally in the browser. Real final submissions automatically request the card email, with no extra checkbox; resource/marketing follow-up remains a separate choice. After the Form confirms a saved response, the browser prepares a preview and sends a separate native POST directly to the same Google receiver only if that receiver explicitly advertises card support. The multiplayer API receives no card recipient or questionnaire payload.

The deployment owner must first install the complete updated Google script and run `setupCardMail` from **qkang1022@gmail.com**, then update the existing web-app deployment to a new version. Keep the same `/exec` URL and execute-as-owner/public-access settings. Do not run `setupForm` again. The owner script and authorization instructions are supplied separately, outside this public repository.

Pending card images and the minimal email content are stored only in that owner's private Google Drive outbox. A Google trigger checks every minute, sending at most ten per execution and respecting the account's remaining recipient quota. Sent outbox files are moved to that owner's Google Drive trash. A consumer Apps Script account normally has 100 recipient sends per 24-hour quota window, shared with its other scripts; larger events may wait across quota windows. Ambiguous send results are held for owner review instead of being automatically resent. No API key, Google authorization token, SMTP password or user responses are present in this repository.

The game API compatibility ID remains `lucy-wonderland-v6-f4434aa46f`; this frontend update does not require restarting the existing game backend. New asset cache tag: `cards2`. Older receiver versions keep normal Form saving and in-browser card previews working, but will not be reported as supporting automatic card email.

Validation: `node tests/cards-client.cjs`, `node tests/cards-flow.cjs`, `node tests/map-mobile.cjs`, `node tests/world-return.cjs`. Google mail/queue tests run in the private source checkout with mock Google services. Actual sender authorization and an inbox delivery test must be completed by the Google deployment owner before calling card email live.
