# Install Atrium with Claude

This file is written for [Claude Code](https://claude.com/claude-code). To use it, paste this into Claude Code:

```
Install Atrium for me: https://github.com/dpichler-22/atrium. Follow INSTALL_WITH_CLAUDE.md.
```

---

## Instructions for Claude

You are installing Atrium, a Chrome new tab extension. Work through the steps in order and keep the user informed in plain language.

### 1. Pick a permanent folder

The browser runs the extension straight from its folder, so the folder must stay put.

- macOS: `~/Applications/atrium`
- Windows: `%USERPROFILE%\atrium`
- Linux: `~/.local/share/atrium`

Avoid folders synced by iCloud or OneDrive, such as Desktop or Documents. Ask before using a different location.

### 2. Download

```sh
git clone https://github.com/dpichler-22/atrium.git <folder>
```

If `git` isn't available, download `atrium-<version>.zip` from the latest release at https://github.com/dpichler-22/atrium/releases/latest and unzip it into the folder.

### 3. Offer to personalize (optional)

Ask the user if they want to change any of these. Skip any they don't care about.

| Setting                 | Where                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------- |
| World clocks (3 cities) | `newtab.html`, the block marked `Customize`. Use IANA time zones such as `Asia/Tokyo`. |
| Currencies              | `initRates()` in `app.js` and the labels in `newtab.html`                              |
| Starter links           | `DEFAULTS` in `app.js`                                                                 |
| Slash commands          | `CMDS` in `app.js`                                                                     |

Rules for edits:

- Keep the same style: plain JavaScript, no libraries.
- Don't add permissions or network calls.
- Don't remove the `key` from `manifest.json`.

### 4. Load it in the browser

The user has to do this part by hand, because browsers don't let tools load extensions.

1. Open the extensions page:
   - macOS: `open -a "Google Chrome" "chrome://extensions"`
   - Other browsers use `edge://extensions` or `brave://extensions`.
   - If the page doesn't open, ask the user to type the address into the address bar.
2. Copy the folder path to the clipboard (`pbcopy` on macOS, `clip` on Windows), so the user can paste it in the file picker.
3. Tell the user:
   1. Turn on **Developer mode** (top right).
   2. Click **Load unpacked** and select the Atrium folder. The path is on the clipboard.
   3. Open a new tab. If Chrome asks whether to keep the new tab change, choose **Keep it**.

### 5. Confirm

Ask the user to press <kbd>/</kbd> on the new tab and check that the command menu appears.

### Updating later

Run `git pull` in the folder, then press the reload arrow on Atrium in `chrome://extensions`. Saved links are kept.
