[![Acceliance](https://www.acceliance.fr/media/wdxp1zys/logo-acc-seul-400.png)](https://www.acceliance.fr)

# Click to Call for Twenty, offered by Acceliance

**Your sales team calls contacts from their Android phone in one click, straight from [Twenty CRM](https://twenty.com), and every call is logged automatically. Free, open source, self-hostable.**

[![Maintained by Acceliance](https://img.shields.io/badge/maintained%20by-Acceliance-0097B6)](https://www.acceliance.fr)
[![License MIT](https://img.shields.io/badge/license-MIT-success)](LICENSE)
[![npm](https://img.shields.io/npm/v/@acceliance/twenty-click-to-call?logo=npm&label=npm)](https://www.npmjs.com/package/@acceliance/twenty-click-to-call)
[![CI](https://github.com/acceliance/twenty-click-to-call/actions/workflows/ci.yml/badge.svg)](https://github.com/acceliance/twenty-click-to-call/actions/workflows/ci.yml)
[![Twenty app](https://img.shields.io/badge/Twenty-2.59%2B-141414)](https://twenty.com)
[![ntfy](https://img.shields.io/badge/push-ntfy-317F6F)](https://ntfy.sh)
[![Android](https://img.shields.io/badge/phone-Android-3DDC84?logo=android&logoColor=white)](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
[![Languages](https://img.shields.io/badge/languages-EN%20%C2%B7%20FR-1F6FEB)](#languages)
[![Self-hosted](https://img.shields.io/badge/data-stays%20on%20your%20servers-002395)](#requirements)

> **Using Twenty for sales?** Acceliance built this app for its own team and **offers** it to the Twenty community.
> Questions, feedback or a custom integration: **[contact@acceliance.fr](mailto:contact@acceliance.fr?subject=Twenty%20Click%20to%20Call)**.
> Deployed it and happy with it? A word of congratulations on [Acceliance's LinkedIn page](https://www.linkedin.com/company/acceliance/) is very welcome 💚

---

## 🚀 Why Click to Call?

Salespeople live in the CRM but call from their mobile. Copying numbers by hand is slow, error-prone, and calls rarely
get logged.

| | Before | With Click to Call |
|---|---|---|
| 📞 **Dialing** | Read the number on screen, type it on the phone | One click in Twenty, one tap on the phone |
| ✅ **Accuracy** | Typos, wrong country code | Number normalized to international format (`+33…`) |
| 📝 **Activity log** | Calls forgotten in the CRM | Every call logged as a done task on the contact, assigned to the caller |
| 🗒️ **Call notes** | Written later, if ever | The task opens right away in the side panel, ready for notes |
| 🔐 **Privacy** | Numbers in third-party apps | Push through **your own** ntfy server; nothing else leaves your infrastructure |
| 📱 **Setup** | Custom mobile app to build and maintain | The free ntfy Android app, configured in two minutes |

## ✨ What it does

1. Click **Call** on a person in Twenty.
2. Your phone gets a push notification with the contact's name, company and number.
3. Tap it: the phone's dialer opens with the number ready. Press call.
4. The call is logged as a **done task** on the contact, assigned to you, and opens in the side panel so you can take notes.

Notifications go through [ntfy](https://ntfy.sh), an open-source push service you can self-host. No custom mobile app is needed: your team uses the free ntfy Android app.

> Android never lets an app place a call silently: the dialer opens and the user presses call.

## 📸 Screenshots

**1. One click on the contact.** The **Call** button (here in French, "Appeler") sits next to "Send email" on every person.

![Call button on a contact](public/gallery/1-call-button.png)

**2. The call is logged and opened.** While the phone rings the dialer, Twenty creates a done task, assigned to you and linked to the contact, and opens it for your notes.

![Logged call task opened in the side panel](public/gallery/2-call-logged-task.png)

**3. Every call stays in the contact's history.**

![Call tasks on the contact](public/gallery/3-tasks-tab.png)

*Screenshots use a fictional contact.*

## How it works

```
Person ─[Call]─► front component ─POST /s/click-to-call/notify─► logic function
   reads the contact with the caller's permissions, builds +33…, publishes to ntfy topic <prefix><user>
                                             ▼
                          ntfy server ─► ntfy Android app ─tap─► dialer (tel:+33…)
```

Each user receives notifications on their own topic: `<prefix>` + the part of their Twenty email before the `@`, made topic-safe. For `jane.doe@example.com` with the default prefix, that's `call-jane-doe`.

## Requirements

- Twenty 2.59 or later, with logic functions enabled on self-hosted servers (`LOGIC_FUNCTION_TYPE=LOCAL` or `LAMBDA`).
- An ntfy server with access control. Self-hosting is strongly recommended: notifications contain contact names and phone numbers. A Docker setup takes a few minutes ([step by step below](#1-ntfy-server)).
- Phones with the ntfy app ([Google Play](https://play.google.com/store/apps/details?id=io.heckel.ntfy) or [App Store](https://apps.apple.com/us/app/ntfy/id1625396347)). Tested on Android; see [step 3](#3-each-phone) for iPhone.

## Setup

### 1. ntfy server

ntfy is a single small container. The setup below is the one we run in production: ntfy with Docker Compose,
behind [Caddy](https://caddyserver.com) for automatic HTTPS. Any Linux host with Docker works, including the
server that hosts Twenty.

**a. DNS.** Point a hostname such as `ntfy.example.com` to the server (A record), and open ports 80 and 443.

**b. `docker-compose.yml`**

```yaml
services:
  ntfy:
    image: binwiederhier/ntfy:v2.11.0
    command: serve
    restart: unless-stopped
    environment:
      NTFY_BASE_URL: https://ntfy.example.com
      NTFY_LISTEN_HTTP: ":80"
      NTFY_BEHIND_PROXY: "true"
      NTFY_CACHE_FILE: /var/lib/ntfy/cache.db
      NTFY_AUTH_FILE: /var/lib/ntfy/user.db
      NTFY_AUTH_DEFAULT_ACCESS: deny-all   # private: nobody reads or writes without an account
      NTFY_ENABLE_SIGNUP: "false"
      NTFY_ENABLE_LOGIN: "true"
    volumes:
      - ntfy-data:/var/lib/ntfy

  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data

volumes:
  ntfy-data:
  caddy-data:
```

**c. `Caddyfile`** (Caddy gets the Let's Encrypt certificate by itself)

```
ntfy.example.com {
	reverse_proxy ntfy:80 {
		flush_interval -1   # keep the phones' live connections streaming
	}
}
```

**d. Start and check**

```bash
docker compose up -d
curl https://ntfy.example.com/v1/health          # {"healthy":true}
curl -d test https://ntfy.example.com/call-test  # 403: anonymous access is refused, as intended
```

**e. Accounts.** One publisher account with a token for Twenty:

```bash
docker compose exec ntfy ntfy user add twenty                     # asks for a password
docker compose exec ntfy ntfy access twenty 'call-*' write-only
docker compose exec ntfy ntfy token add twenty                    # copy the tk_… token
```

Then one read-only account per Twenty user (here `jane.doe@example.com`):

```bash
docker compose exec ntfy ntfy user add jane-doe
docker compose exec ntfy ntfy access jane-doe call-jane-doe read-only
```

**f. Test a notification** before installing the app. Subscribe a phone to `call-jane-doe` (step 3), then:

```bash
curl -H "Authorization: Bearer tk_…" -H "Click: tel:+33100000000" \
     -d "Tap me: the dialer should open" https://ntfy.example.com/call-jane-doe
```

Already have a reverse proxy (nginx, Traefik…)? Skip Caddy and proxy your hostname to the ntfy container, with
response buffering off. See the [ntfy install docs](https://docs.ntfy.sh/install/) and
[configuration reference](https://docs.ntfy.sh/config/).

### 2. App settings in Twenty

Install the app, then open **Settings → Apps → Click to Call → Variables**:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NTFY_URL` | yes | | Your ntfy server, e.g. `https://ntfy.example.com` |
| `NTFY_TOKEN` | yes | | The publisher token (`tk_…`), stored as a secret |
| `NTFY_TOPIC_PREFIX` | no | `call-` | Topic prefix for each user |
| `CALL_TASK_TITLE` | no | `Call` | Title of the logged task (e.g. `Appel`). Empty = no task |

### 3. Each phone

Install the free ntfy app:

[![Get it on Google Play](docs/badges/badge-googleplay.png)](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
[![Download on the App Store](docs/badges/badge-appstore.png)](https://apps.apple.com/us/app/ntfy/id1625396347)

> **iPhone:** we have only tested Android. iOS delivers notifications from a self-hosted server through ntfy.sh, so
> add `NTFY_UPSTREAM_BASE_URL: https://ntfy.sh` to the ntfy service (see the
> [ntfy iOS docs](https://docs.ntfy.sh/config/#ios-instant-notifications)).

In the ntfy app: **Settings → Manage users → Add user** with your ntfy server and account, then **+** → topic `call-jane-doe`, tick **Use another server**, enter your server URL and turn on **Instant delivery**.

Reload Twenty after installing or updating the app to see the button.

## Permissions

The app reads the contact and the caller's workspace member, and creates the call task and its link to the contact. It never deletes records. Every action runs with the clicking user's own permissions on top of the app's role.

## Languages

English and French (`locales/`). Contributions for other languages are welcome: run `twenty app translations extract --locale <locale>`.

## Development

Requires Node 24.5+ and Yarn 4 (on Windows, use WSL 2).

```bash
npm install -g twenty
yarn install
twenty auth login --url https://your-twenty.example.com
yarn typecheck && yarn test:unit
twenty app apply --create   # first install; then `twenty app dev` or `twenty app apply`
```

Releases are published to npm from GitHub Actions with provenance (`.github/workflows/publish.yml`): bump `version` in `package.json`, then push a `vX.Y.Z` tag.

## 💚 Happy with it?

If Click to Call saves your team time, tell us! A congratulations message or a short post about your setup on
**[Acceliance's LinkedIn page](https://www.linkedin.com/company/acceliance/)** is very welcome, and a ⭐ on this
repository helps other Twenty users find it.

## License

[MIT](LICENSE) © Acceliance

---

## 🏆 Built by Acceliance

Click to Call is a small example of how **Acceliance** connects business tools with automation: a CRM button, a
serverless function, a self-hosted push service and the phone's own dialer, assembled into one smooth workflow with
no new mobile app to maintain.

- **Twenty CRM apps**: buttons, logic functions, workflows, data models and integrations for your sales process;
- **AI automation**: knowledge graphs, RAG, agents (MCP, A2A), governed AI and model-centric architectures;
- **Sovereign deployments**: on-premise or on the host of your choice, GDPR and AI Act ready.

Want the same approach for your own processes? **[Let's talk](mailto:contact@acceliance.fr?subject=Twenty%20%2F%20AI%20project)**.
See also our free AI candidate-matching platform, [CVMatcher](https://github.com/acceliance/CVMatcher-Deploy), and our
prompt generator, [MasterPrompter](https://masterprompter.acceliance.fr).

## 🤝 About Acceliance

**Acceliance** designs AI and automation architectures and solutions: knowledge graphs, RAG, agents, business
modeling, AI governance and sovereign deployments.

📧 [contact@acceliance.fr](mailto:contact@acceliance.fr) · 🌐 [www.acceliance.fr](https://www.acceliance.fr) ·
🐙 [github.com/acceliance](https://github.com/acceliance) · 💼 [LinkedIn](https://www.linkedin.com/company/acceliance/)

**Your CRM knows who to call. Now your phone does too.**
