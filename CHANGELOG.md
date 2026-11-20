# Changelog

## 0.1.5

- Call task: the comment is prefilled with the number sent to the phone (`+33612345678 : `), ready for call notes.

## 0.1.4

- README: Google Play and App Store links for the ntfy app, iPhone setup note (upstream to ntfy.sh).
- README: invitation to share feedback on Acceliance's LinkedIn page.

## 0.1.3

- README: step-by-step ntfy server deployment (Docker Compose + Caddy, accounts, test notification).
- Gallery screenshots: workspace contact count hidden.

## 0.1.2

- Marketplace gallery: three screenshots (call button, logged call task, tasks tab) with a fictional contact.
- Publish workflow fixes (Corepack, npm 11).

## 0.1.1

- First release published from GitHub Actions with npm provenance (required to claim the app in the Twenty marketplace).
- README: Acceliance presentation, support email in the app metadata.

## 0.1.0

- "Call on mobile" button on People: sends an ntfy push to the caller's Android phone; tapping it opens the dialer with the contact's number.
- Logs each call as a done task on the contact, assigned to the caller, and opens it in the side panel.
- English and French translations.
