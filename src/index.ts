import { DISPOSABLE_DOMAINS } from "./domains.js";
import { extractDomain } from "./utils.js";

/**
 * Checks whether an email address belongs to a known disposable email provider.
 *
 * @param email - A full email address (e.g. `"user@mailinator.com"`).
 * @returns `true` if the domain is disposable, `false` if the email is
 *          invalid or the domain is not in the blocklist.
 *
 * @example
 * ```ts
 * isDisposableEmail("user@mailinator.com"); // true
 * isDisposableEmail("user@gmail.com");      // false
 * isDisposableEmail("not-an-email");        // false
 * ```
 */
export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (domain === null) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Checks whether a bare domain is a known disposable email provider.
 *
 * @param domain - A domain name (e.g. `"mailinator.com"`).
 * @returns `true` if the domain is in the blocklist.
 *
 * @example
 * ```ts
 * isDisposableDomain("mailinator.com"); // true
 * isDisposableDomain("gmail.com");      // false
 * ```
 */
export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.trim().toLowerCase());
}

/**
 * Returns a sorted array of all known disposable email domains.
 *
 * Each call returns a **new** array copy, so mutations do not affect
 * the internal dataset.
 *
 * @returns A sorted `string[]` of disposable domains.
 *
 * @example
 * ```ts
 * const domains = getDisposableDomains();
 * console.log(domains.length); // ~5134
 * ```
 */
export function getDisposableDomains(): string[] {
  return Array.from(DISPOSABLE_DOMAINS).sort();
}
