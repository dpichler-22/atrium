# Contributing to Atrium

Thanks for helping. Atrium is small on purpose, and these rules keep it that way.

## Principles

1. **Stay light.** No frameworks, libraries or build step. Plain HTML, CSS and JavaScript only.
2. **Nothing runs when idle.** No background service worker, no polling and no timers beyond the clock.
3. **Private by default.** Never store search queries. Don't add analytics. Only connect to a service when the user does something that needs it.
4. **Quiet design.** Neutral grays, the system font, and Lucide icons at stroke 1.75. Every new element should earn its place.

## Run it locally

1. Fork and clone the repo.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select the folder.
3. After a change, press the reload arrow on Atrium and open a new tab.

## Before you open a pull request

- [ ] Format with Prettier using the repo's `.prettierrc`: `npx prettier --write .`
- [ ] Test in both dark and light themes.
- [ ] Check memory: compare an Atrium tab with an empty tab in Chrome's Task Manager (<kbd>Shift</kbd> + <kbd>Esc</kbd> on Windows/Linux, **Window → Task Manager** on macOS). Mention any change in the PR.
- [ ] If you add a permission or a network call, update the Privacy and Permissions tables in the README.
- [ ] Add a line to `CHANGELOG.md` under an `Unreleased` heading.

## Reporting bugs and ideas

Use the [issue templates](https://github.com/dpichler-22/atrium/issues/new/choose). For security problems, see [SECURITY.md](SECURITY.md).
