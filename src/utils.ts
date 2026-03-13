/**
 * Extracts the domain portion from an email address.
 *
 * Uses `lastIndexOf("@")` to handle quoted `@` in the local part
 * without regex — no ReDoS risk.
 *
 * @returns The lowercased domain, or `null` if the input is not a
 *          structurally valid email address.
 */
export function extractDomain(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) return null;

  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;

  const domain = trimmed.slice(atIndex + 1).toLowerCase();
  if (domain.length === 0) return null;

  const dotIndex = domain.indexOf(".");
  if (dotIndex <= 0 || dotIndex === domain.length - 1) return null;

  return domain;
}
