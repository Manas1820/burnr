# burnr

[![npm version](https://img.shields.io/npm/v/burnr.svg)](https://www.npmjs.com/package/burnr)
[![license](https://img.shields.io/npm/l/burnr.svg)](./LICENSE)

Detect disposable (burner) email domains. Zero dependencies, auto-updated dataset.

## Install

```bash
npm install burnr
```

## Usage

```ts
import { isDisposableEmail, isDisposableDomain, getDisposableDomains } from "burnr";

isDisposableEmail("user@mailinator.com"); // true
isDisposableEmail("user@gmail.com");      // false
isDisposableEmail("not-an-email");        // false

isDisposableDomain("guerrillamail.com");  // true
isDisposableDomain("outlook.com");        // false

const domains = getDisposableDomains();   // string[] — sorted, ~5000+ entries
```

## API

### `isDisposableEmail(email: string): boolean`

Returns `true` if the email's domain is a known disposable email provider. Returns `false` for invalid emails.

### `isDisposableDomain(domain: string): boolean`

Returns `true` if the bare domain is in the disposable blocklist. Handles uppercase and whitespace.

### `getDisposableDomains(): string[]`

Returns a sorted array of all known disposable domains. Each call returns a new copy.

## How it works

The domain dataset is sourced from [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) and compiled into a `Set<string>` at build time — no file I/O at runtime.

A GitHub Actions cron job syncs the upstream list daily. When domains change, tests run automatically and a new patch version is published to npm via [semantic-release](https://github.com/semantic-release/semantic-release).

## License

MIT
