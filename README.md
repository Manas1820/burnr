<div align="center">

# fakeout

**Catch disposable emails before they catch you.**

[![npm version](https://img.shields.io/npm/v/fakeout?color=cb3837&label=npm&logo=npm)](https://www.npmjs.com/package/fakeout)
[![bundle size](https://img.shields.io/bundlephobia/minzip/fakeout?color=364fc7&label=size)](https://bundlephobia.com/package/fakeout)
[![license](https://img.shields.io/github/license/Manas1820/fakeout?color=22863a)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Manas1820/fakeout/release.yml?label=CI&logo=github)](https://github.com/Manas1820/fakeout/actions)

A tiny, zero-dependency library that detects disposable (burner) email domains.
The blocklist auto-updates daily — no manual maintenance required.

[Install](#install) · [Usage](#usage) · [API](#api) · [How it works](#how-it-works)

</div>

---

## Why?

Disposable email services like Mailinator, Guerrilla Mail, and thousands of others let users sign up with throwaway addresses. This means fake accounts, abused trials, and wasted resources. **fakeout** lets you detect them with a single function call.

- **5,000+ domains** tracked and growing
- **Zero dependencies** — just a `Set` lookup
- **Auto-updated** — new domains added daily via CI
- **TypeScript-first** — full type safety and JSDoc

## Install

```bash
# npm
npm install fakeout

# pnpm
pnpm add fakeout

# yarn
yarn add fakeout
```

> Requires Node.js 18+

## Usage

```ts
import { isDisposableEmail, isDisposableDomain, getDisposableDomains } from "fakeout";

// Check a full email address
isDisposableEmail("user@mailinator.com");  // true
isDisposableEmail("user@gmail.com");       // false
isDisposableEmail("not-an-email");         // false (invalid → false)

// Check a bare domain
isDisposableDomain("guerrillamail.com");   // true
isDisposableDomain("outlook.com");         // false

// Get the full list
const domains = getDisposableDomains();    // string[] — sorted, ~5000+ entries
```

### Common patterns

**Express middleware:**

```ts
import { isDisposableEmail } from "fakeout";

app.post("/signup", (req, res) => {
  if (isDisposableEmail(req.body.email)) {
    return res.status(422).json({ error: "Disposable emails are not allowed" });
  }
  // proceed with signup...
});
```

**Form validation:**

```ts
import { isDisposableEmail } from "fakeout";

function validateEmail(email: string): string | null {
  if (isDisposableEmail(email)) {
    return "Please use a permanent email address";
  }
  return null;
}
```

## API

### `isDisposableEmail(email: string): boolean`

Checks if an email address belongs to a known disposable provider.

| Input | Output |
|-------|--------|
| `"user@mailinator.com"` | `true` |
| `"user@gmail.com"` | `false` |
| `"bad-input"` | `false` |

Returns `false` for invalid emails rather than throwing.

### `isDisposableDomain(domain: string): boolean`

Checks if a bare domain is in the blocklist. Handles uppercase and extra whitespace.

| Input | Output |
|-------|--------|
| `"guerrillamail.com"` | `true` |
| `"  YOPMAIL.COM  "` | `true` |
| `"gmail.com"` | `false` |

### `getDisposableDomains(): string[]`

Returns a sorted array of all known disposable domains. Each call returns a fresh copy, so mutations won't affect the internal dataset.

## How it works

```
                    ┌─────────────────────────┐
                    │  Upstream blocklist      │
                    │  (disposable-email-      │
                    │   domains/disposable-    │
                    │   email-domains)         │
                    └────────────┬────────────┘
                                 │ daily cron
                                 ▼
                    ┌─────────────────────────┐
                    │  sync-domains script    │
                    │  fetch → clean → hash   │
                    │  → compare → generate   │
                    └────────────┬────────────┘
                                 │ if changed
                                 ▼
                    ┌─────────────────────────┐
                    │  semantic-release       │
                    │  patch bump → publish   │
                    │  to npm                 │
                    └─────────────────────────┘
```

1. A GitHub Actions cron job runs daily
2. It fetches the latest domain list from upstream
3. If the list changed (SHA-256 comparison), tests run and a new **patch version** is auto-published to npm
4. If nothing changed, the job exits silently

The domain list is compiled into a `ReadonlySet<string>` at build time — **zero file I/O at runtime**, just a fast hash lookup.

## Credits

The disposable domain dataset is sourced from the community-maintained [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) project. Huge thanks to all its contributors for keeping the list comprehensive and up to date.

## Contributing

Contributions are welcome! If you find a domain that should be blocked:

- For **new disposable domains**, please submit them upstream to [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains/issues) — they'll be picked up automatically on the next sync
- For **bugs or feature requests** in fakeout itself, [open an issue](https://github.com/Manas1820/fakeout/issues)

## License

[MIT](./LICENSE) — use it however you like.
