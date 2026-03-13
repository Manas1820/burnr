import { describe, it, expect } from "vitest";
import {
  isDisposableEmail,
  isDisposableDomain,
  getDisposableDomains,
} from "../src/index.js";
import { extractDomain } from "../src/utils.js";
import { DISPOSABLE_DOMAINS } from "../src/domains.js";

// ---------------------------------------------------------------------------
// extractDomain (unit tests for the parser)
// ---------------------------------------------------------------------------
describe("extractDomain", () => {
  it("extracts domain from a standard email", () => {
    expect(extractDomain("user@example.com")).toBe("example.com");
  });

  it("lowercases the domain", () => {
    expect(extractDomain("user@EXAMPLE.COM")).toBe("example.com");
  });

  it("trims whitespace from input", () => {
    expect(extractDomain("  user@example.com  ")).toBe("example.com");
  });

  it("uses lastIndexOf to handle quoted @ in local part", () => {
    expect(extractDomain('"weird@local"@example.com')).toBe("example.com");
  });

  it("handles subdomains", () => {
    expect(extractDomain("user@mail.example.co.uk")).toBe("mail.example.co.uk");
  });

  it("returns null for empty string", () => {
    expect(extractDomain("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(extractDomain("   ")).toBeNull();
  });

  it("returns null for no @ sign", () => {
    expect(extractDomain("nope")).toBeNull();
  });

  it("returns null when @ is first character (no local part)", () => {
    expect(extractDomain("@example.com")).toBeNull();
  });

  it("returns null when @ is last character (no domain)", () => {
    expect(extractDomain("user@")).toBeNull();
  });

  it("returns null for @ only", () => {
    expect(extractDomain("@")).toBeNull();
  });

  it("returns null when domain has no dot (no TLD)", () => {
    expect(extractDomain("user@localhost")).toBeNull();
  });

  it("returns null when domain starts with a dot", () => {
    expect(extractDomain("user@.com")).toBeNull();
  });

  it("returns null when domain ends with a dot", () => {
    expect(extractDomain("user@example.")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isDisposableEmail
// ---------------------------------------------------------------------------
describe("isDisposableEmail", () => {
  describe("detects known disposable providers", () => {
    const disposableEmails = [
      "user@mailinator.com",
      "test@guerrillamail.com",
      "foo@yopmail.com",
      "someone@tempmail.de",
      "a@trashmail.com",
      "x@10minutemail.com",
    ];

    it.each(disposableEmails)("returns true for %s", (email) => {
      expect(isDisposableEmail(email)).toBe(true);
    });
  });

  describe("allows legitimate providers", () => {
    const legitimateEmails = [
      "user@gmail.com",
      "user@outlook.com",
      "user@yahoo.com",
      "user@hotmail.com",
      "user@icloud.com",
      "user@protonmail.com",
      "user@hey.com",
      "user@fastmail.com",
      "user@company.org",
      "admin@mycompany.io",
    ];

    it.each(legitimateEmails)("returns false for %s", (email) => {
      expect(isDisposableEmail(email)).toBe(false);
    });
  });

  describe("case insensitivity", () => {
    it("detects disposable domain regardless of casing", () => {
      expect(isDisposableEmail("USER@MAILINATOR.COM")).toBe(true);
      expect(isDisposableEmail("User@Mailinator.Com")).toBe(true);
      expect(isDisposableEmail("user@mailinator.COM")).toBe(true);
    });

    it("allows legitimate domain regardless of casing", () => {
      expect(isDisposableEmail("USER@GMAIL.COM")).toBe(false);
      expect(isDisposableEmail("User@Gmail.Com")).toBe(false);
    });
  });

  describe("whitespace handling", () => {
    it("trims leading and trailing spaces", () => {
      expect(isDisposableEmail("  user@mailinator.com  ")).toBe(true);
      expect(isDisposableEmail("  user@gmail.com  ")).toBe(false);
    });

    it("trims tabs", () => {
      expect(isDisposableEmail("\tuser@mailinator.com\t")).toBe(true);
    });
  });

  describe("invalid inputs return false (never throws)", () => {
    const invalidInputs = [
      "",
      " ",
      "not-an-email",
      "@",
      "@mailinator.com",
      "user@",
      "user@localhost",
      "user@.com",
      "user@com.",
      "@@",
      "user@@domain.com",
    ];

    it.each(invalidInputs)("returns false for %j", (input) => {
      expect(isDisposableEmail(input)).toBe(false);
    });
  });

  it("handles email with multiple @ (uses lastIndexOf)", () => {
    expect(isDisposableEmail('"weird@local"@mailinator.com')).toBe(true);
    expect(isDisposableEmail('"weird@local"@gmail.com')).toBe(false);
  });

  it("handles + addressing (subaddressing)", () => {
    expect(isDisposableEmail("user+tag@mailinator.com")).toBe(true);
    expect(isDisposableEmail("user+tag@gmail.com")).toBe(false);
  });

  it("handles very long local parts", () => {
    const longLocal = "a".repeat(200);
    expect(isDisposableEmail(`${longLocal}@mailinator.com`)).toBe(true);
    expect(isDisposableEmail(`${longLocal}@gmail.com`)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isDisposableDomain
// ---------------------------------------------------------------------------
describe("isDisposableDomain", () => {
  describe("detects known disposable domains", () => {
    const disposable = [
      "mailinator.com",
      "guerrillamail.com",
      "yopmail.com",
      "tempmail.de",
      "trashmail.com",
    ];

    it.each(disposable)("returns true for %s", (domain) => {
      expect(isDisposableDomain(domain)).toBe(true);
    });
  });

  describe("allows legitimate domains", () => {
    const legitimate = [
      "gmail.com",
      "outlook.com",
      "yahoo.com",
      "hotmail.com",
      "protonmail.com",
      "company.com",
      "university.edu",
    ];

    it.each(legitimate)("returns false for %s", (domain) => {
      expect(isDisposableDomain(domain)).toBe(false);
    });
  });

  it("handles uppercase", () => {
    expect(isDisposableDomain("MAILINATOR.COM")).toBe(true);
    expect(isDisposableDomain("GMAIL.COM")).toBe(false);
  });

  it("trims whitespace", () => {
    expect(isDisposableDomain("  mailinator.com  ")).toBe(true);
    expect(isDisposableDomain("\tyopmail.com\n")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isDisposableDomain("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getDisposableDomains
// ---------------------------------------------------------------------------
describe("getDisposableDomains", () => {
  it("returns a substantial number of domains", () => {
    const domains = getDisposableDomains();
    expect(domains.length).toBeGreaterThan(1000);
  });

  it("returns a sorted array", () => {
    const domains = getDisposableDomains();
    for (let i = 1; i < domains.length; i++) {
      expect(domains[i] >= domains[i - 1]).toBe(true);
    }
  });

  it("returns a new array copy each call (mutation safe)", () => {
    const a = getDisposableDomains();
    const b = getDisposableDomains();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);

    // mutating one does not affect the other
    a.push("fakestuff.test");
    const c = getDisposableDomains();
    expect(c).not.toContain("fakestuff.test");
  });

  it("contains well-known disposable domains", () => {
    const domains = getDisposableDomains();
    expect(domains).toContain("mailinator.com");
    expect(domains).toContain("guerrillamail.com");
    expect(domains).toContain("yopmail.com");
  });

  it("does not contain major email providers", () => {
    const domains = getDisposableDomains();
    expect(domains).not.toContain("gmail.com");
    expect(domains).not.toContain("outlook.com");
    expect(domains).not.toContain("yahoo.com");
    expect(domains).not.toContain("hotmail.com");
    expect(domains).not.toContain("icloud.com");
    expect(domains).not.toContain("protonmail.com");
  });

  it("all entries are lowercase trimmed strings", () => {
    const domains = getDisposableDomains();
    for (const d of domains) {
      expect(d).toBe(d.toLowerCase().trim());
      expect(d.length).toBeGreaterThan(0);
    }
  });

  it("all entries contain at least one dot", () => {
    const domains = getDisposableDomains();
    for (const d of domains) {
      expect(d).toContain(".");
    }
  });
});

// ---------------------------------------------------------------------------
// DISPOSABLE_DOMAINS (dataset integrity)
// ---------------------------------------------------------------------------
describe("DISPOSABLE_DOMAINS dataset", () => {
  it("is a ReadonlySet", () => {
    expect(DISPOSABLE_DOMAINS).toBeInstanceOf(Set);
  });

  it("has a reasonable size (guard against empty/corrupt data)", () => {
    expect(DISPOSABLE_DOMAINS.size).toBeGreaterThan(1000);
  });

  it("does not contain empty strings", () => {
    expect(DISPOSABLE_DOMAINS.has("")).toBe(false);
  });

  it("entries are consistent with isDisposableDomain", () => {
    // every entry in the set should be detected by isDisposableDomain
    const sample = Array.from(DISPOSABLE_DOMAINS).slice(0, 50);
    for (const domain of sample) {
      expect(isDisposableDomain(domain)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration: consistency between functions
// ---------------------------------------------------------------------------
describe("cross-function consistency", () => {
  it("isDisposableEmail and isDisposableDomain agree", () => {
    const testDomains = ["mailinator.com", "gmail.com", "yopmail.com", "outlook.com"];
    for (const domain of testDomains) {
      expect(isDisposableEmail(`test@${domain}`)).toBe(isDisposableDomain(domain));
    }
  });

  it("getDisposableDomains contains exactly what the Set has", () => {
    const arr = getDisposableDomains();
    expect(arr.length).toBe(DISPOSABLE_DOMAINS.size);
    for (const domain of arr) {
      expect(DISPOSABLE_DOMAINS.has(domain)).toBe(true);
    }
  });
});
